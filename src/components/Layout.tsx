import { Outlet, useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sparkles, LogOut, Briefcase, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ModeToggle } from './ModeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

export default function Layout({ user }: { user: any }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(auth);
    navigate('/login');
  };

  const navLinks = (
    <>
      <Link to="/" className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 transition-colors">
        <Briefcase className="mr-3 h-5 w-5 opacity-70" />
        Workspaces
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col transition-colors">
      <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger className="md:hidden mr-2 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle mobile menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px] bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-0 z-[200]">
                <SheetHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800 text-left">
                  <SheetTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                    <div className="h-8 w-8 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span>SocialPipeline</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 flex flex-col gap-2">
                  {navLinks}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg flex items-center justify-center hidden md:flex">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold tracking-tight text-sm hidden md:inline-block">SocialPipeline</span>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <ModeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex justify-center items-center h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none">
                <div className="text-xs uppercase font-medium">{user.email?.charAt(0) || 'U'}</div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 z-[100]">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-neutral-900 dark:text-neutral-100">{user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-neutral-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                <DropdownMenuItem className="hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer text-sm p-0">
                  <Link to="/" className="flex w-full items-center px-1.5 py-1">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Workspaces</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                <DropdownMenuItem className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 hover:text-red-600 dark:hover:text-red-300 cursor-pointer text-sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-7xl flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
