import type { Participant } from "@/typedefs/CsvTypes";
import type { Component, ParentComponent } from "solid-js";

export const GenericBlankCard: ParentComponent<{
}> = (props) => {
  return (
    <div class="bg-base-100 p-4 w-full shadow-sm flex flex-row gap-4 outline outline-solid outline-gray-200 rounded items-center">
      {props.children}
    </div>
  )
}