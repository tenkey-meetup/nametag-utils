import { isValidRawParticipantsCsvEntry, type Participant, type RawParticipantsCsvEntry } from '@/typedefs/CsvTypes'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { createEffect, createResource, createSignal, Match, Show, Suspense, Switch } from 'solid-js'
import Papa from 'papaparse';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { ExternalBarcodeReaderMode } from '@/components/NametagChecker/Views/ExternalBarcodeReaderMode';
import { ResultsDisplayMode } from '@/components/NametagChecker/Views/ResultsDisplayMode';
import { CameraReaderMode } from '@/components/NametagChecker/Views/CameraReaderMode';
import { LOCALSTORAGE_PARTICIPANTS, LOCALSTORAGE_SCANS, LOCALSTORAGE_REJECTS } from '@/settings';


export const Route = createFileRoute('/nametag-checker/')({
  component: NametagCheckerPage,
})


// Main page
function NametagCheckerPage() {

  const [inputFile, setInputFile] = createSignal<File | null>(null)
  const [errorString, setErrorString] = createSignal<string | null>(null)

  const [participantsList, setParticipantsList, participantsInit] = makePersisted(createSignal<Participant[]>([]), { name: LOCALSTORAGE_PARTICIPANTS, storage: localStorage, sync: storageSync });
  const [scanList, setScanList, scanListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_SCANS, storage: localStorage, sync: storageSync });
  const [rejectList, setRejectList, rejectListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_REJECTS, storage: localStorage, sync: storageSync });
  createResource(() => participantsInit)[0]();
  createResource(() => scanListInit)[0]();
  createResource(() => rejectListInit)[0]();

  // On input file change, process CSV and overwrite participants list
  createEffect(() => {
    const file = inputFile()
    if (!file) {
      return
    }
    Papa.parse<RawParticipantsCsvEntry, File>(file, {
      header: true,
      beforeFirstChunk: () => {
        setErrorString(null)
        console.log("Starting parse")
      },
      complete: (results) => {
        // Check for valid headers
        if (!results.meta.fields?.includes("受付番号")) {
          setErrorString("CSVに「受付番号」の列がありません。")
        }
        else if (!results.meta.fields?.includes("ユーザー名")) {
          setErrorString("CSVに「ユーザー名」の列がありません。")
        }
        else if (!results.meta.fields?.includes("表示名")) {
          setErrorString("CSVに「表示名」の列がありません。")
        }
        else if (!results.meta.fields?.includes("参加ステータス")) {
          setErrorString("CSVに「参加ステータス」の列がありません。")
        }
        // Process if correct
        else {
          // Sanity check and build state
          let participants = []
          for (const entry of results.data) {
            if (!isValidRawParticipantsCsvEntry(entry)) {
              setErrorString(`参加者のデータを読み込めませんでした：${JSON.stringify(entry)}`)
              return
            }
            participants.push({
              registrationId: entry.受付番号,
              username: entry.ユーザー名,
              displayName: entry.表示名,
              connpassAttending: entry.参加ステータス === "参加" ? true : false
            })
          }
          setParticipantsList(participants)
        }
      },
      error: (error => {
        setErrorString(error.message)
      })
    });
  })

  // Handle file select, setting inputFile as necessary
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files!.length !== 1) {
      console.error("Invalid file")
      setInputFile(null)
    } else {
      setInputFile(files![0])
    }
  }

  // Wipe saved progress
  const wipeProgress = () => {
    setScanList([])
    setRejectList([])
  }

  // Wipe all data
  const wipeAll = () => {
    wipeProgress()
    setInputFile(null)
    setParticipantsList([])
  }

  const params = Route.useParams()
  // Refs
  let confirmDeleteModal
  let confirmResetProgressModal
  return (
    <>

      <div class="container mx-auto flex flex-col items-center pt-4">
        <h1 class="text-3xl">名札の存在確認</h1>
        <Suspense>

          <Show when={errorString()}>
            <p>Error: {errorString()}</p>
          </Show>

          <Switch>
            <Match when={participantsList().length === 0}>
              <div class="pt-4 flex flex-col items-center">
                <p>参加者CSVをアップロードしてください。</p>
                <input type="file" class="file-input" accept=".csv, text/csv" on:change={(e) => handleFileSelect(e.target.files)} />
              </div>
            </Match>
            <Match when={participantsList().length > 0}>
              <div class="flex flex-col items-center pt-4 gap-3">
                <p>現在{participantsList().length}人分のデータが読み込まれてます。</p>
                <Link to={"/nametag-checker/scan-camera" as never} class="btn btn-primary">スマホのカメラで確認を開始</Link>
                <Link to={"/nametag-checker/scan-external" as never} class="btn btn-secondary">外付けバーコードリーダーで確認を開始</Link>
                <div class="pt-3" />
                <Link class="btn btn-outline btn-success" to={"/nametag-checker/results" as never}>結果確認</Link>
                <button class="btn btn-outline btn-warning" onClick={() => confirmResetProgressModal!.showModal()}>現在の進捗をリセット</button>
                <button class="btn btn-outline btn-error" onClick={() => confirmDeleteModal!.showModal()}>保存データを全削除</button>
              </div>
            </Match>
          </Switch>
        </Suspense>
      </div>

      {/* Delete-all dialog */}
      <dialog id="confirm-delete-modal" class="modal" ref={confirmDeleteModal}>
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 class="text-lg font-bold">保存データの削除</h3>
          <p class="py-4">アップロードされたCSVの内容、現在の確認の進捗などは全て破棄されます。</p>
          <div class="modal-action">
            <form method="dialog" class="flex flex-row gap-2">
              <button class="btn" onClick={(e) => { e.preventDefault(); confirmDeleteModal!.close() }}>キャンセル</button>
              <button class="btn btn-error" onClick={(e) => { e.preventDefault(); wipeAll(); confirmDeleteModal!.close() }}>削除</button>
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Wipe progress dialog */}
      <dialog id="confirm-reset-progress-modal" class="modal" ref={confirmResetProgressModal}>
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 class="text-lg font-bold">現在の進捗をリセット</h3>
          <p class="py-4">現在スキャンしたバーコードのリストをリセットします。</p>
          <p class="py-4">アップロードされた参加者CSVのデータはそのまま保管されます。</p>
          <div class="modal-action">
            <form method="dialog" class="flex flex-row gap-2">
              <button class="btn" onClick={(e) => { e.preventDefault(); confirmResetProgressModal!.close() }}>キャンセル</button>
              <button class="btn btn-error" onClick={(e) => { e.preventDefault(); wipeProgress(); confirmResetProgressModal!.close() }}>削除</button>
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>

  )
}
