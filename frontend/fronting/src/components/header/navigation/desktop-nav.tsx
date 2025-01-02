import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuContent,
    NavigationMenuTrigger,
  } from '@/components/ui/navigation-menu'
  import { menuItems } from './menu-items'
  
  export function DesktopNav() {
    return (
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList className="gap-1">
          {menuItems.map((item) => (
            <NavigationMenuItem key={item.label}>
              {item.submenu ? (
                <>
                  <NavigationMenuTrigger className="h-9 px-4 hover:bg-accent/50">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-4">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.label}>
                          <NavigationMenuLink
                            href={subItem.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            {subItem.label}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink
                  href={item.href}
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  {item.label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    )
  }