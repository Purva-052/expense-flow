import React, { ReactNode, useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NavCollapsible, NavItem, NavLink, type NavGroup } from "./types";

function useScrollToActive<T extends HTMLElement>(isActive: boolean | undefined, ref: React.RefObject<T | null>) {
  React.useEffect(() => {
    if (isActive && ref.current) {
      const timer = setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, ref]);
}

function useSyncOpenState(isActive: boolean | undefined, defaultState: boolean | undefined) {
  const [isOpen, setIsOpen] = useState(defaultState ?? false);

  React.useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  return [isOpen, setIsOpen] as const;
}

export function NavGroup({ title, items, isCollapsible, defaultOpen }: NavGroup) {
  const { state } = useSidebar();
  const href = useLocation({ select: (location) => location.href });
  const isActive = items.some(item => checkIsActive(href, item, true));
  const [isOpen, setIsOpen] = useSyncOpenState(isActive, defaultOpen ?? isActive ?? false);

  // If the group is collapsible (like Masters), render with toggle functionality
  if (isCollapsible) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel
          className="cursor-pointer flex items-center justify-between hover:bg-accent transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          />
        </SidebarGroupLabel>
        {isOpen && (
          <SidebarMenu>
            {items.map((item) => {
              const key = `${item.title}-${item.url}`;

              if (!item.items)
                return <SidebarMenuLink key={key} item={item} href={href} />;

              if (state === "collapsed")
                return (
                  <SidebarMenuCollapsedDropdown
                    key={key}
                    item={item}
                    href={href}
                  />
                );

              return (
                <SidebarMenuCollapsible key={key} item={item} href={href} />
              );
            })}
          </SidebarMenu>
        )}
      </SidebarGroup>
    );
  }

  // Default rendering for non-collapsible groups
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} />;

          if (state === "collapsed")
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
            );

          return <SidebarMenuCollapsible key={key} item={item} href={href} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
);

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const isActive = checkIsActive(href, item);
  const ref = React.useRef<HTMLLIElement>(null);
  useScrollToActive(isActive, ref);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setOpenMobile(false);
      navigate({ to: item.url });
    },
    [navigate, item.url, setOpenMobile]
  );

  return (
    <SidebarMenuItem ref={ref}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link to={item.url} onClick={handleClick}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SubItemLink = ({ subItem, href }: { subItem: NavItem; href: string }) => {
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const isActive = checkIsActive(href, subItem);
  const ref = React.useRef<HTMLLIElement>(null);
  useScrollToActive(isActive, ref);

  return (
    <SidebarMenuSubItem ref={ref}>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link
          to={subItem.url}
          onClick={(e) => {
            e.preventDefault();
            setOpenMobile(false);
            navigate({ to: subItem.url });
          }}
        >
          {subItem.icon && <subItem.icon />}
          <span>{subItem.title}</span>
          {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
  const isActive = checkIsActive(href, item, true);
  const [isOpen, setIsOpen] = useSyncOpenState(isActive, item.defaultClosed ? false : isActive);

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SubItemLink key={subItem.title} subItem={subItem} href={href} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
  const navigate = useNavigate();
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(href, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                to={sub.url}
                className={`${checkIsActive(href, sub) ? "bg-secondary" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ to: sub.url });
                }}
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && (
                  <span className="ml-auto text-xs">{sub.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  const currentPath = href.split("?")[0]; // Remove query params
  const itemPath = item.url;

  return (
    href === itemPath || // Exact match with query params
    currentPath === itemPath || // Exact match without query params
    !!item?.items?.filter((i) => i.url === href).length || // If child nav is active
    (mainNav &&
      href.split("/")[1] !== "" &&
      href.split("/")[1] === itemPath?.split("/")[1]) ||
    // Check if current path is a sub-route of the item (e.g., /projects/123/edit should match /projects)
    (itemPath && currentPath.startsWith(itemPath + "/"))
  );
}
