import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  IconArrowRightDashed,
  IconChevronRight,
  IconDeviceLaptop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useSearch } from "@/context/search-context";
import { useTheme } from "@/context/theme-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { sidebarData } from "./layout/data/sidebar-data";
import { ScrollArea } from "./ui/scroll-area";
import { useAuthStore } from "@/stores/use-auth-store";

export function CommandMenu() {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();
  const { user } = useAuthStore();
  const role = user?.user?.role || "";
  const id = user?.user?.id;

  const hasSidebarAccess = React.useCallback(
    (item: {
      requiredRoles?: string[];
      allowUserIDs?: number[];
    }) => {
      const hasRoleAccess = item.requiredRoles?.includes(role) ?? false;
      const hasUserIDsAccess = item.allowUserIDs?.includes(id) ?? false;

      return hasRoleAccess || hasUserIDsAccess;
    },
    [id, role]
  );

  const filteredNavGroups = React.useMemo(
    () =>
      sidebarData.navGroups
        .filter((group) => {
          if (!group.requiredRoles && !group.allowUserIDs) return true;
          return hasSidebarAccess(group);
        })
        .map((group) => ({
          ...group,
          items: group.items
            .filter((item) => hasSidebarAccess(item))
            .map((item) => {
              if (!item.items) return item;

              return {
                ...item,
                items: item.items.filter((subItem) => hasSidebarAccess(subItem)),
              };
            }),
        }))
        .filter((group) => group.items.length > 0),
    [hasSidebarAccess]
  );

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pr-1">
          <CommandEmpty>No data found.</CommandEmpty>
          {filteredNavGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => navigate({ to: navItem.url }));
                      }}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center">
                        <IconArrowRightDashed className="text-muted-foreground/80 size-2" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  );

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    value={`${navItem.title}-${subItem.url}`}
                    onSelect={() => {
                      runCommand(() => navigate({ to: subItem.url }));
                    }}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      <IconArrowRightDashed className="text-muted-foreground/80 size-2" />
                    </div>
                    {navItem.title} <IconChevronRight /> {subItem.title}
                  </CommandItem>
                ));
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <IconSun /> <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <IconMoon className="scale-90" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <IconDeviceLaptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
