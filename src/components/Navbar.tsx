import { Link } from "@tanstack/solid-router";
import { children, For, type ParentComponent } from "solid-js";


export const Navbar: ParentComponent<{
  navbarItems: {label: string, path: string}[]
}> = (props) => {

  return (
    <div class="drawer">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        {/* <!-- Navbar --> */}
        <div class="navbar bg-base-300 w-full">
          <div class="flex-none lg:hidden">
            <label for="my-drawer-2" aria-label="open sidebar" class="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block h-6 w-6 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div class="mx-2 flex-1 px-2"><Link to={"/"}>天キー　ツールキット</Link></div>
          <div class="hidden flex-none lg:block">
            <ul class="menu menu-horizontal">
              {/* Navbar items - Desktop*/}
              <For each={props.navbarItems}>
                {(entry) => 
                  <li><a href={entry.path}>{entry.label}</a></li>
                }
              </For>
            </ul>
          </div>
        </div>
        {/* Content if specified */}
        {props.children}
      </div>
      <div class="drawer-side">
        <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-200 min-h-full w-80 p-4">
          {/* Sidebar items */}
          <For each={props.navbarItems}>
            {(entry) => 
              <li><a href={entry.path}>{entry.label}</a></li>
            }
          </For>
        </ul>
      </div>
    </div>
  )
}