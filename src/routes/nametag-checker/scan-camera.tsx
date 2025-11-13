import { type Participant } from '@/typedefs/CsvTypes'
import { createFileRoute } from '@tanstack/solid-router'
import { createResource, createSignal } from 'solid-js'
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { CameraReaderMode } from '@/components/NametagChecker/Views/CameraReaderMode';
import { LOCALSTORAGE_PARTICIPANTS, LOCALSTORAGE_SCANS, LOCALSTORAGE_REJECTS } from '@/settings';


export const Route = createFileRoute('/nametag-checker/scan-camera')({
  component: ScanCameraPage,
})


// Scan via phone camera page
function ScanCameraPage() {


  const [participantsList, _, participantsInit] = makePersisted(createSignal<Participant[]>([]), { name: LOCALSTORAGE_PARTICIPANTS, storage: localStorage, sync: storageSync });
  const [scanList, setScanList, scanListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_SCANS, storage: localStorage, sync: storageSync });
  const [rejectList, setRejectList, rejectListInit] = makePersisted(createSignal<string[]>([]), { name: LOCALSTORAGE_REJECTS, storage: localStorage, sync: storageSync });
  createResource(() => participantsInit)[0]();
  createResource(() => scanListInit)[0]();
  createResource(() => rejectListInit)[0]();

  // Quick lookup list for IDs
  const participantIdsList = () => participantsList().map(entry => entry.registrationId)

  // Handle scanning from child views
  const onScan = (id: string) => {
    if (id === "") { return }
    if (!participantIdsList().includes(id)) {
      // setRejectList([...rejectList(), id])
      setRejectList([...new Set([id, ...rejectList()])])
    } else {
      setScanList([...new Set([id, ...scanList()])])
    }
  }


  const params = Route.useParams()
  // Refs
  let confirmDeleteModal
  let confirmResetProgressModal
  return (

    <CameraReaderMode
      participants={participantsList()}
      scans={scanList()}
      rejects={rejectList()}
      onScan={onScan}
    />


  )
}
