import { createEffect, createMemo, createResource, createSignal, For, onCleanup, onMount, Show, type Component } from "solid-js"
import { BarcodeDetectorPolyfill as BarcodeDetector } from '@undecaf/barcode-detector-polyfill'
import { createCameras } from '@solid-primitives/devices'
import { createPermission } from '@solid-primitives/permission'
import { createMediaPermissionRequest, createStream } from '@solid-primitives/stream'
import beepSound from '@/assets/Beep-Trimmed.wav'


export const CameraBarcodeReader: Component<{
  activate: boolean, // When true, barcodes will be read and onScan will be fired if detected
  onScan: (id: string) => void
}> = (props) => {

  const [cameraError, setCameraError] = createSignal<string | null>(null)
  const [cameras, setCameras] = createSignal<MediaDeviceInfo[] | undefined>(undefined)
  const [camera, setCamera] = createSignal<MediaDeviceInfo | undefined>(undefined)
  const barcodeReader = new BarcodeDetector({ formats: ['code_128'] })
  const sound = new Audio(beepSound)
  let cameraVideoRef!: HTMLVideoElement


  // Request permission for cameras and get devices list
  async function queryCameras() {
    if (!navigator.mediaDevices) {
      setCameraError("カメラ機能またはカメラが存在しません。")
      return
    }
    try {
      // Request permission
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then(async (mediaStream) => {
          // Close the temporary mediaStream used for requesting permission
          mediaStream.getTracks().forEach(track => track.stop())
          // List and set devices
          const videoDevices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === "videoinput")
          setCameras(videoDevices)
        })
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        setCameraError(error.toString())
      } else {
        setCameraError(JSON.stringify(error))
      }
    }
  }


  // On cameras list change, assign the most promising one as the primary
  createEffect(() => {
    if (cameras()) {
      // Look for "facing back"
      setCamera(() => cameras()!.find(dev => dev.label.includes("back")) || cameras()![0])
      setCameraError(null)
    }
  })


  // Fire off the permission-requesting and camera load chain on component mount
  onMount(() => {
    queryCameras()
  })


  // On primary camera change, set video stream
  createEffect(() => {
    console.log(camera())
    if (!camera() || !cameraVideoRef) { return }
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        width: { min: 640, ideal: 2560, max: 3840 },
        height: { min: 480, ideal: 1440, max: 2560 },
        frameRate: { ideal: 30, max: 60 },
        deviceId: camera()?.deviceId,
        aspectRatio: { ideal: 16/9 }
        },
      }
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      cameraVideoRef.srcObject = stream;
      cameraVideoRef.onloadedmetadata = () => {
        cameraVideoRef.play()
      }
    })
    .catch((error: Error) => {
      console.error(error)
      setCameraError(error.toString())
    })
  })


  // Repeatedly scan for barcodes while possible and requested to
  // Parent should immediately set props.activate to false to prevent duplicate scans
  const scanTimer = setInterval(() => {
    if (cameraVideoRef && !cameraVideoRef.paused && props.activate) {
      console.log("Can take")
      barcodeReader.detect(cameraVideoRef)
      .then(output => {
        if (props.activate && output.length > 0) {
          // Run onScan for all found barcodes
          output.forEach(code => {
            props.onScan(code.rawValue)
          })
          // Give feedback to the user
          navigator.vibrate?.(20)
          sound.play()
        }
      })
    }
  }, 100)


  // Cleanup function
  onCleanup(() => {
    clearInterval(scanTimer)
    if (cameraVideoRef && cameraVideoRef.srcObject) {
      (cameraVideoRef.srcObject as MediaStream).getTracks().forEach(track => track.stop())
      cameraVideoRef.srcObject = null
    }
  });
  

  return (
    <div class="flex flex-col items-center gap-2">
      <Show when={camera()}>
        <div class="relative aspect-video w-[100vw] md:w-[50vw] md:rounded-md overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-full">
            <video ref={cameraVideoRef} autoplay class="object-cover w-full h-full" />
          </div>
          <Show when={props.activate}>
            <div class="absolute top-0 left-0 w-full h-full flex flex-col justify-center">
              <div class="w-full h-[2px] bg-red-400" />
            </div>
          </Show>
        </div>
      </Show>
      <Show when={cameras()}>
        <div class="flex flex-row items-center gap-1">
          <p class="text-nowrap">カメラ</p>
          <select class="select" value={camera()?.deviceId} onChange={(e) => setCamera(cameras() ? cameras()!.find(entry => entry.deviceId === e.target.value) : undefined)}>
            <For each={cameras()}>
              {camera => <option value={camera.deviceId}>{camera.label}</option>}
            </For>
          </select>
        </div>
      </Show>

      <Show when={!camera()}>
        <button class="btn btn-primary mt-4" onClick={() => { queryCameras() }}>カメラアクセスを許可する</button>
      </Show>
      <Show when={cameraError()}>
        <p class="mt-4 text-red-500">エラー：{cameraError()}</p>
      </Show>

    </div>
  )
}
