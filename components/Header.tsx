import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import WalletConnection from "./web3/WalletConnection";
import { useWeb3 } from "../contexts/Web3Context";
import { useTheme } from "../contexts/ThemeContext";
import { NETWORKS } from "../libs/constants";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const { evmNetwork, switchEvmNetwork } = useWeb3();
  const { theme, toggleTheme } = useTheme();

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNetwork = NETWORKS.find(network => network.name === e.target.value);
    
    if (selectedNetwork?.menuLink) {
      window.location.href = selectedNetwork.menuLink;
    } else {
      switchEvmNetwork(e.target.value);
    }
  };

  return (
    <Disclosure as="nav" className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>
                <select 
                  value={evmNetwork || ""}
                  onChange={handleNetworkChange}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" disabled>Select Network</option>
                  {NETWORKS.filter(network => network.addToMenu).map((network) => (
                    <option key={network.name} value={network.name}>
                      {network.name}
                    </option>
                  ))}
                </select>
                <WalletConnection />
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
