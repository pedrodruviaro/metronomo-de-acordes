import { useState, useEffect, useRef, useCallback } from "react"
import { usePersist } from "./hook/use-persist"

export function App() {
  const [bpm, setBpm] = usePersist<number>("guitar-learner-bpm", 60)
  const [intervalo, setIntervalo] = usePersist<number>(
    "guitar-learner-intervalo",
    4
  )
  const [acordes, setAcordes] = usePersist<string[]>("guitar-learner-acordes", [
    "C",
    "D",
    "E",
    "G",
    "A",
  ])
  const [modoAleatorio, setModoAleatorio] = usePersist<boolean>(
    "guitar-learner-modo-aleatorio",
    true
  )
  const [acordeAtual, setAcordeAtual] = useState<string>("")
  const [proximoAcorde, setProximoAcorde] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [batidaAtual, setBatidaAtual] = useState(0)

  const intervaloRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const contadorBatidasRef = useRef(0)
  const indiceSequencialRef = useRef(0)
  const proximoAcordeRef = useRef<string>("")

  useEffect(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    audioContextRef.current = new AudioContextClass()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const calcularProximoAcorde = useCallback(
    (acordeAtual: string) => {
      if (acordes.length === 0) return ""

      if (modoAleatorio) {
        const acordesDisponiveis = acordes.filter(
          (acorde) => acorde !== acordeAtual
        )
        if (acordesDisponiveis.length > 0) {
          const indiceAleatorio = Math.floor(
            Math.random() * acordesDisponiveis.length
          )
          return acordesDisponiveis[indiceAleatorio]
        } else if (acordes.length === 1) {
          return acordes[0]
        }
      } else {
        const indiceAtual = acordes.findIndex(
          (acorde) => acorde === acordeAtual
        )
        if (indiceAtual !== -1) {
          indiceSequencialRef.current = (indiceAtual + 1) % acordes.length
        } else {
          indiceSequencialRef.current =
            (indiceSequencialRef.current + 1) % acordes.length
        }
        return acordes[indiceSequencialRef.current]
      }
      return ""
    },
    [acordes, modoAleatorio]
  )

  const tocarSom = () => {
    if (!audioContextRef.current) return

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  useEffect(() => {
    if (isPlaying && !isPaused && acordes.length > 0) {
      const intervaloMs = (60 / bpm) * 1000

      intervaloRef.current = setInterval(() => {
        tocarSom()
        contadorBatidasRef.current += 1
        setBatidaAtual(contadorBatidasRef.current)

        if (contadorBatidasRef.current % intervalo === 0) {
          const acordeQueVaiSerTocado = proximoAcordeRef.current

          if (acordeQueVaiSerTocado) {
            setAcordeAtual(acordeQueVaiSerTocado)

            const proximoDepoisDeste = calcularProximoAcorde(
              acordeQueVaiSerTocado
            )

            proximoAcordeRef.current = proximoDepoisDeste
            setProximoAcorde(proximoDepoisDeste)
          }
        }
      }, intervaloMs)

      return () => {
        if (intervaloRef.current) {
          clearInterval(intervaloRef.current)
        }
      }
    } else {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
    }
  }, [isPlaying, isPaused, bpm, intervalo, acordes, calcularProximoAcorde])

  const iniciar = () => {
    if (acordes.length === 0) {
      alert("Adicione pelo menos um acorde!")
      return
    }

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume()
    }

    setIsPaused(false)
    setIsPlaying(true)
    contadorBatidasRef.current = 0
    setBatidaAtual(0)

    let primeiroAcorde: string
    if (modoAleatorio) {
      const indiceAleatorio = Math.floor(Math.random() * acordes.length)
      primeiroAcorde = acordes[indiceAleatorio]
    } else {
      indiceSequencialRef.current = 0
      primeiroAcorde = acordes[0]
    }
    const primeiroProximo = calcularProximoAcorde(primeiroAcorde)
    proximoAcordeRef.current = primeiroProximo
    setAcordeAtual(primeiroAcorde)
    setProximoAcorde(primeiroProximo)
  }

  const pausar = () => {
    setIsPaused(true)
  }

  const continuar = () => {
    setIsPaused(false)
  }

  const parar = () => {
    setIsPlaying(false)
    setIsPaused(false)
    contadorBatidasRef.current = 0
    setBatidaAtual(0)
    setAcordeAtual("")
    setProximoAcorde("")
    proximoAcordeRef.current = ""
    indiceSequencialRef.current = 0
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
  }

  const adicionarAcorde = () => {
    const novoAcorde = prompt("Digite o nome do acorde:")
    if (novoAcorde && novoAcorde.trim() !== "") {
      setAcordes([...acordes, novoAcorde.trim()])
    }
  }

  const removerAcorde = (index: number) => {
    const acordeARemover = acordes[index]

    if (
      isPlaying &&
      (acordeARemover === acordeAtual || acordeARemover === proximoAcorde)
    ) {
      alert(
        `Não é possível remover o acorde "${acordeARemover}" enquanto ele está sendo usado no exercício.`
      )
      return
    }

    if (acordes.length <= 1) {
      alert("Você precisa ter pelo menos um acorde na lista!")
      return
    }

    setAcordes(acordes.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-300 to-purple-300">
            Metrônomo de Acordes
          </span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <label className="block text-lg font-semibold mb-4">
                BPM: {bpm}
              </label>
              <input
                type="range"
                min="40"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full"
                disabled={isPlaying}
              />

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setBpm(bpm - 1)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition w-10 h-10 grid place-items-center"
                >
                  &minus;
                </button>

                <button
                  onClick={() => setBpm(bpm + 1)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition w-10 h-10 grid place-items-center"
                >
                  &#43;
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <label className="block text-lg font-semibold mb-4">
                Intervalo entre acordes: {intervalo} batidas
              </label>
              <input
                type="range"
                min="1"
                max="16"
                value={intervalo}
                onChange={(e) => setIntervalo(Number(e.target.value))}
                className="w-full"
                disabled={isPlaying}
              />

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setIntervalo(intervalo - 1)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition w-10 h-10 grid place-items-center"
                >
                  &minus;
                </button>

                <button
                  onClick={() => setIntervalo(intervalo + 1)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition w-10 h-10 grid place-items-center"
                >
                  &#43;
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Acordes</h2>
                <button
                  onClick={adicionarAcorde}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
                  disabled={isPlaying}
                >
                  + Adicionar
                </button>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modo-aleatorio"
                  checked={modoAleatorio}
                  onChange={(e) => setModoAleatorio(e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                  disabled={isPlaying}
                />
                <label
                  htmlFor="modo-aleatorio"
                  className="text-sm cursor-pointer select-none"
                >
                  Executar acordes em ordem aleatória
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {acordes.map((acorde, index) => {
                  const isAcordeAtual = acorde === acordeAtual
                  const isProximoAcorde = acorde === proximoAcorde
                  const podeRemover =
                    !isPlaying || (!isAcordeAtual && !isProximoAcorde)

                  return (
                    <div
                      key={index}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isAcordeAtual
                          ? "bg-blue-600 ring-2 ring-blue-400"
                          : isProximoAcorde
                          ? "bg-yellow-600 ring-2 ring-yellow-400"
                          : "bg-gray-700"
                      }`}
                    >
                      <span className="font-semibold">{acorde}</span>
                      {podeRemover && (
                        <button
                          onClick={() => removerAcorde(index)}
                          className="text-red-400 hover:text-red-300 text-lg font-bold transition hover:scale-110"
                          title="Remover acorde"
                        >
                          &times;
                        </button>
                      )}
                      {!podeRemover && (
                        <span
                          className="text-xs text-gray-300"
                          title="Acorde em uso"
                        >
                          🎵
                        </span>
                      )}
                    </div>
                  )
                })}
                {acordes.length === 0 && (
                  <p className="text-gray-400">
                    Nenhum acorde adicionado. Clique em "Adicionar" para
                    começar.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center">
              <div className="text-2xl font-bold text-white mb-2">
                Acorde Atual
              </div>
              <div className="text-6xl font-bold">{acordeAtual || "-"}</div>
              <div className="text-sm text-blue-200 mt-4">
                Batida: {batidaAtual}
              </div>
            </div>

            {isPlaying && proximoAcorde && (
              <div className="bg-gray-700 rounded-lg p-6 text-center border-2 border-gray-600">
                <div className="text-sm text-gray-300 mb-2">Próximo Acorde</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {proximoAcorde}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Troca em {intervalo - (batidaAtual % intervalo)} batidas
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6 flex gap-4 justify-center">
              {!isPlaying ? (
                <button
                  onClick={iniciar}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold text-lg transition"
                >
                  Iniciar
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={continuar}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition"
                    >
                      Continuar
                    </button>
                  ) : (
                    <button
                      onClick={pausar}
                      className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3 rounded-lg font-semibold text-lg transition"
                    >
                      Pausar
                    </button>
                  )}
                  <button
                    onClick={parar}
                    className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold text-lg transition"
                  >
                    Parar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
