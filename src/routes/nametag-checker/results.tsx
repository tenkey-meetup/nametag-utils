import { type Participant } from '@/typedefs/CsvTypes'
import { createFileRoute } from '@tanstack/solid-router'
import { createResource, createSignal } from 'solid-js'
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { LOCALSTORAGE_PARTICIPANTS, LOCALSTORAGE_SCANS, LOCALSTORAGE_REJECTS } from '@/settings';
import { ExternalBarcodeReaderMode } from '@/components/NametagChecker/Views/ExternalBarcodeReaderMode';
import { ResultsDisplayMode } from '@/components/NametagChecker/Views/ResultsDisplayMode';


export const Route = createFileRoute('/nametag-checker/results')({
  component: ResultsPage,
})


// Main page
function ResultsPage() {


  const [participantsList, setParticipantsList, participantsInit] = makePersisted(createSignal<Participant[]>([]), { name: LOCALSTORAGE_PARTICIPANTS, storage: localStorage, sync: storageSync });
  const [scanList, setScanList, scanListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_SCANS, storage: localStorage, sync: storageSync });
  const [rejectList, setRejectList, rejectListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_REJECTS, storage: localStorage, sync: storageSync });
  createResource(() => participantsInit)[0]();
  createResource(() => scanListInit)[0]();
  createResource(() => rejectListInit)[0]();


  const params = Route.useParams()
  // Refs
  let confirmDeleteModal
  let confirmResetProgressModal
  return (

    <ResultsDisplayMode
      participants={participantsList()}
      scans={scanList()}
      rejects={rejectList()}
    />

  )
}
