import type { Participant } from "@/typedefs/CsvTypes";
import type { Component } from "solid-js";

export const ParticipantCard: Component<{
  participant: Participant,
}> = (props) => {

  return (
    <div class="bg-base-100 p-4 w-full shadow-sm flex flex-row gap-4 outline outline-solid outline-gray-200 rounded items-center">
      <h2 class="font-semibold text-xl">{props.participant.displayName}</h2>
      <div>
        <p>ユーザー名：{props.participant.username}</p>
        <p>受付番号：{props.participant.registrationId}</p>
      </div>
    </div>
  )
}