import { type Participant } from '@/typedefs/CsvTypes'
import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createEffect, createResource, createSignal, For, Match, Switch } from 'solid-js'
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { LOCALSTORAGE_PARTICIPANTS, LOCALSTORAGE_SCANS, LOCALSTORAGE_REJECTS } from '@/settings';
import { ParticipantCard } from '@/components/ParticipantCard';


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

  const unscannedParticipants = () => participantsList().filter(entry => !scanList().includes(entry.registrationId))
  const unscannedAttendingParticipants = () => unscannedParticipants().filter(entry => entry.connpassAttending)
  const unscannedCancelledParticipants = () => unscannedParticipants().filter(entry => !entry.connpassAttending)
  const scannedParticipants = () => participantsList().filter(entry => scanList().includes(entry.registrationId))

  const navigate = useNavigate()

  // Prevent navigating in if participantsList is empty
  createEffect(() => {
    if (participantsList().length === 0) {
      navigate({ to: '/nametag-checker' })
    }
  })


  return (
    <div class="container mx-auto flex flex-col items-center pt-4 gap-4 lg:gap-8 px-3 lg:px-0">
      <h1 class="text-3xl">名札の存在確認</h1>


      <div class="card card-sm lg:card-md bg-primary card-border shadow-sm w-full lg:w-1/2">
        <div class="card-body flex flex-col">
          <h3 class="card-title text-primary-content">現在確認が取れてない名札の数（キャンセル済みを除く）: <span class={unscannedAttendingParticipants().length > 0 ? "text-red-400" : "text-green-400"}>{unscannedAttendingParticipants().length}人</span></h3>

          <Switch>

            <Match when={unscannedAttendingParticipants().length === 0}>
              <p class="text-gray-400">全名札の確認が取れました。</p>
            </Match>

            <Match when={unscannedAttendingParticipants().length > 0}>
              <div tabindex="0" class="collapse bg-base-100 border-base-300 border collapse-arrow w-full">
                <div class="collapse-title font-semibold">スキャンされてない参加者のリスト</div>
                <div class="collapse-content flex flex-col gap-4 items-center">
                  <button class="btn btn-primary" onClick={() => { navigator.clipboard.writeText(unscannedAttendingParticipants().map(participant => participant.registrationId).join(",")) }}>全IDをコピー</button>
                  <For each={unscannedAttendingParticipants()}>
                    {entry => <ParticipantCard participant={entry} />}
                  </For>
                </div>
              </div>
            </Match>

          </Switch>
        </div>
      </div>

      <div class="card card-sm lg:card-md bg-secondary card-border shadow-sm w-full lg:w-1/2">
        <div class="card-body flex flex-col">
          <h3 class="card-title text-secondary-content">スキャンされた名札の数: <span>{scannedParticipants().length}人</span></h3>

          <div tabindex="0" class="collapse bg-base-100 border-base-300 border collapse-arrow w-full">
            <div class="collapse-title font-semibold">スキャン済みの参加者のリスト</div>
            <div class="collapse-content flex flex-col gap-4 items-center">
              <button class="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(scannedParticipants().map(participant => participant.registrationId).join(",")) }}>全IDをコピー</button>
              <For each={scannedParticipants()}>
                {entry => <ParticipantCard participant={entry} />}
              </For>
            </div>
          </div>
        </div>
      </div>


      <div class="card card-sm lg:card-md bg-base-200 card-border shadow-sm w-full lg:w-1/2">
        <div class="card-body flex flex-col">
          <h3 class="card-title">スキャンされたが参加者リストに存在しない受付番号: <span class={rejectList().length > 0 ? "text-red-500" : "text-green-500"}>{rejectList().length}人</span></h3>

          <Switch>

            <Match when={rejectList().length === 0}>
              <p class="text-gray-400">スキャンミスは存在しません。</p>
            </Match>

            <Match when={rejectList().length > 0}>
              <div tabindex="0" class="collapse bg-base-100 border-base-300 border collapse-arrow w-full">
                <div class="collapse-title font-semibold">スキャンされた存在しないIDリスト</div>
                <div class="collapse-content flex flex-col gap-4 items-center">
                  <button class="btn btn-primary" onClick={() => { navigator.clipboard.writeText(rejectList().join(",")) }}>全IDをコピー</button>
                  <For each={rejectList()}>
                    {entry => <div class="card bg-base-100 w-full shadow-sm">
                      <div class="card-body">
                        <h2 class="card-title">{entry}</h2>
                        <p>Test</p>
                      </div>
                    </div>}
                  </For>
                </div>
              </div>
            </Match>
          </Switch>
        </div>
      </div>

      <div class="card card-sm lg:card-md bg-base-200 card-border shadow-sm w-full lg:w-1/2">
        <div class="card-body flex flex-col">
          <h3 class="card-title text-gray-400">名札が確認されていないキャンセル済み参加者の数: <span class="text-gray-4h00">{unscannedCancelledParticipants().length}人</span></h3>

          <Switch>

            <Match when={unscannedCancelledParticipants().length === 0}>
              <p class="text-gray-400">全名札の確認が取れました。</p>
            </Match>

            <Match when={unscannedCancelledParticipants().length > 0}>
              <div tabindex="0" class="collapse bg-base-100 border-base-300 border collapse-arrow w-full">
                <div class="collapse-title font-semibold text-gray-400">スキャンされてないキャンセル済み参加者のリスト</div>
                <div class="collapse-content flex flex-col gap-4 items-center">
                  <button class="btn btn-primary" onClick={() => { navigator.clipboard.writeText(unscannedCancelledParticipants().map(participant => participant.registrationId).join(",")) }}>全IDをコピー</button>
                  <For each={unscannedCancelledParticipants()}>
                    {entry => <ParticipantCard participant={entry} />}
                  </For>
                </div>
              </div>
            </Match>

          </Switch>
        </div>
      </div>

      <Link to={"/nametag-checker"} class="btn btn-primary mb-4">メニューに戻る</Link>

    </div>
  )
}
