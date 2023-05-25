import { Dialog, Menu, Transition } from "@headlessui/react";
import { Bars2Icon, UserIcon, XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import React from "react";
import { Link, NavLink, useParams } from "react-router-dom";

import { logout } from "@/features/auth/authSlice";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { closeBuyCredits, openBuyCredits, selectBuyCreditsOpen } from "@/features/misc/buyCreditsSlice";
import { BuyCreditsModalContents } from "@/features/users/components/BuyCreditsModalContents";
import { queryClient } from "@/lib/react-query";
import { useAppDispatch } from "@/redux/hooks";
import storage from "@/utils/storage";
import { Divider, Modal } from "@mantine/core";
import { useAppSelector } from '../../redux/hooks';
import { Button } from "../Button";
import { Logo } from "../Logo";

type SideNavigationItem = {
  name: string;
  to: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

const navigation = [].filter(Boolean) as SideNavigationItem[];

type UserNavigationItem = {
  name: string;
  to: string;
  onClick?: () => void;
};

const UserNavigation = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const userNavigation = [
    { name: "Your Profile", to: "./profile" },
    {
      name: "Sign out",
      to: "/",
      onClick: () => {
        queryClient.getQueryCache().clear();
        queryClient.clear();
        storage.setAzureToken("");
        dispatch(logout());
      },
    },
  ].filter(Boolean) as UserNavigationItem[];

  return (
    <Menu as="div" className="relative ml-3">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="flex  max-w-xs items-center rounded-full bg-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="sr-only">Open user menu</span>
              <UserIcon className="h-8 w-8 rounded-full" />
            </Menu.Button>
          </div>
          <Transition
            show={open}
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div className="h-8 pt-2">
                <div className="mx-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {/* <CurrencyDollarIcon className="h-4 w-4" /> */}
                    <i className="text-xs font-semibold">
                      {user.credits.toFixed(0)} credits
                    </i>
                  </div>
                  <Button className="ml-2" size="xs" variant="inverse">
                    Buy
                  </Button>
                </div>
              </div>
              <Divider className="mt-3" variant="dashed" />
              {userNavigation.map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => (
                    <Link
                      onClick={item.onClick}
                      to={item.to}
                      className={clsx(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

type MobileSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MobileSidebar = ({ sidebarOpen, setSidebarOpen }: MobileSidebarProps) => {
  return (
    <Transition.Root show={sidebarOpen} as={React.Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 z-40 flex md:hidden"
        open={sidebarOpen}
        onClose={setSidebarOpen}
      >
        <Transition.Child
          as={React.Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>
        <Transition.Child
          as={React.Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-100 pt-5 pb-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XCircleIcon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </Transition.Child>
            <div className="flex flex-shrink-0 items-center px-4">
              <Logo />
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                <>
                  {navigation.map((item, index) => (
                    <NavLink
                      end={index === 0}
                      key={item.name}
                      to={item.to}
                      className="group flex items-center rounded-md px-2 py-2 text-base font-medium"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={clsx("mr-4 h-6 w-6 flex-shrink-0")}
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </>
              </nav>
            </div>
          </div>
        </Transition.Child>
        <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
      </Dialog>
    </Transition.Root>
  );
};

const Navigation = () => {
  return (
    <div className="hidden h-16 px-4 md:flex">
      <Logo />
      <div className="ml-4 flex items-center">
        {navigation.map((item, index) => (
          <NavLink
            end={index === 0}
            key={item.name}
            to={item.to}
            className={clsx(
              "hover:font-bold",
              "group flex items-center rounded-md px-2 py-2 text-base font-medium"
            )}
          >
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const { user } = useAuth();
  const opened = useAppSelector((state) => selectBuyCreditsOpen(state));  
  const dispatch = useAppDispatch();
  const close = () => dispatch(closeBuyCredits())
  
  const openBuy = () => {
    dispatch(openBuyCredits());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars2Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 md:px-8">
            <Navigation />
            {projectName && (
              <Link
                to={`/app/projects/${projectName}`}
                className="flex items-center justify-center"
              >
                <h1 className="text-sm italic text-gray-700">
                  {"> "}
                  {projectName}
                </h1>
              </Link>
            )}
            <div className="flex flex-1 justify-end px-4">
              <div className="ml-4 flex items-center md:ml-6">
                <Button
                  onClick={() => openBuy()}
                  size="md"
                  variant="inverse"
                >
                  {user.credits.toFixed(0)} credits
                </Button>
                <UserNavigation />
              </div>
            </div>
          </div>
        </div>
        <main className="relative flex-1 overflow-y-auto text-black focus:outline-none">
          <Modal opened={opened} onClose={close} centered>
            <BuyCreditsModalContents />
          </Modal>

          {children}
        </main>
      </div>
    </div>
  );
};
