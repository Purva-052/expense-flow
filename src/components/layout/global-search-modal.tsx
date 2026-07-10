import * as React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { sidebarData } from "./data/sidebar-data";
import { useSidebarAccess } from "@/hooks/use-sidebar-access";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function GlobalSearchModal() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const { hasSidebarAccess } = useSidebarAccess();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    setSearch("");
    setTimeout(() => {
      command();
    }, 250); // Wait for Dialog close transition (200ms) to finish completely before navigating
  }, []);

  const filteredGroups = React.useMemo(() => {
    return sidebarData.navGroups
      .filter((group: any) => {
        if (!group.requiredRoles && !group.allowUserIDs && !group.allowedTech)
          return true;
        return hasSidebarAccess(group);
      })
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item: any) => hasSidebarAccess(item))
          .map((item: any) => {
            if (item.items && Array.isArray(item.items)) {
              return {
                ...item,
                items: item.items.filter((subItem: any) =>
                  hasSidebarAccess(subItem)
                ),
              };
            }
            return item;
          }),
      }))
      .filter((group) => group.items.length > 0);
  }, [hasSidebarAccess]);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search Sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search (Cmd+K)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CommandDialog 
        open={open} 
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            setTimeout(() => setSearch(""), 150); // Clear after exit animation
          }
        }}
      >
        <CommandInput 
          placeholder="Type a command or search..." 
          value={search} 
          onValueChange={setSearch} 
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item: any) => {
                if (item.items && item.items.length > 0) {
                  return item.items.map((subItem: any) => (
                    <CommandItem
                      key={subItem.title}
                      value={`${group.title} ${item.title} ${subItem.title}`}
                      onSelect={() => {
                        runCommand(() => navigate({ to: subItem.url }));
                      }}
                    >
                      {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                      <span>{item.title} - {subItem.title}</span>
                    </CommandItem>
                  ));
                }

                return (
                  <CommandItem
                    key={item.title}
                    value={`${group.title} ${item.title}`}
                    onSelect={() => {
                      runCommand(() => navigate({ to: item.url }));
                    }}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
