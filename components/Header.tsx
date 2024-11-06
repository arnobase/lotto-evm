import React from "react";

//import { usePathname } from 'next/navigation'
//import LuckyLogo from "../assets/lucky.svg";
//import LuckyLogo from "../../public/images/Lucky_logo_black_bg.png";
import lotto_svg from "../public/images/lotto.svg"
//import github_svg from "../assets/github.svg"
import discord_svg from "../public/images/discord.svg"
//import telegram_svg from "../assets/telegram.svg"
import x_svg from "../public/images/x.svg"

//import NetworkSelect from "./NetworkSelect.js";
//import AccountSelect from "./AccountSelect.js";
import ExportedImage from "next-image-export-optimizer";
//import { ApiContext } from "../context/ApiProvider.js";
//import { useContext } from "react";

import { Fragment } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import WalletConnector from "../components/WalletConnector";
import { useWeb3 } from "../contexts/Web3Context";
import { NETWORKS } from "../libs/constants";


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface NavigationItem {
  name: string;
  href: string;
  img?: string;
  blank?: boolean;
  current: boolean;
}

const Header: React.FC = () => {
  //const pathname = usePathname();
  const { evmNetwork, switchEvmNetwork } = useWeb3();

  //const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
  const navigation: NavigationItem[] = [
   /* { name: 'Lotto', href: isStaticExport ? '/index.html' : '/', img: undefined, current: pathname.startsWith("/") },
    { name: 'About', href: isStaticExport ? '/about.html' : '/about', img: undefined, current: pathname === "/about" },*/
    { name: '', href: 'https://discord.gg/R3jjRSZ6D9', img: discord_svg, blank: true, current: false },
    { name: '', href: 'https://twitter.com/LuckyDapp', img: x_svg, blank: true, current: false },
  ]

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchEvmNetwork(e.target.value);
  };

  return (
    <Disclosure as="nav" className="">
      {({ open }: { open: boolean }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-24 items-center justify-between ">
              
              <div className="flex flex-1 sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <ExportedImage
                    className="h-7 w-auto"
                    src={lotto_svg}
                    alt="Lucky dApp"
                  />
                </div>
                <div className="inset-y-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
                <div className="pl-4 inset-y-0 items-center sm:inline-flex hidden">
                  <div className="self-center flex space-x-4">
                    {navigation.map((item, i) => {
                      return <a
                          key={item.name+i}
                          href={item.href}
                          target={item.blank?"_blank":"_self"}
                          className={classNames(
                          item.current
                            ? "bg-gray-800 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-full px-3 py-2 text-sm font-medium cursor:pointer"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.img ? <ExportedImage
                          className="inline h-5 w-auto pb-1 invert"
                          src={item.img}
                          alt={item.name}
                        /> : null}{item.name}
                      </a>}
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <WalletConnector />
                <select 
                  value={evmNetwork}
                  onChange={handleNetworkChange}
                  className="bg-gray-700 text-white px-3 py-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" disabled>Select Network</option>
                  {NETWORKS.map((network) => (
                    <option key={network.name} value={network.name}>
                      {network.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.img ? <ExportedImage
                          className="inline h-4 w-auto invert"
                          src={item.img}
                          alt={item.name}
                        /> : null}{item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default Header;
