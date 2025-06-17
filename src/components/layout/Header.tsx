
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm" data-id="oiwply551" data-path="src/components/layout/Header.tsx">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="ucatadiv1" data-path="src/components/layout/Header.tsx">
        <div className="flex justify-between items-center h-16" data-id="zl4c5jdld" data-path="src/components/layout/Header.tsx">
          <div className="flex items-center space-x-3" data-id="uktpaptbr" data-path="src/components/layout/Header.tsx">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full" data-id="3qzdk20b4" data-path="src/components/layout/Header.tsx">
              <MapPin className="h-6 w-6 text-white" data-id="sr4rw7wcy" data-path="src/components/layout/Header.tsx" />
            </div>
            <div data-id="tme56hlee" data-path="src/components/layout/Header.tsx">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-id="n6mgc6p2x" data-path="src/components/layout/Header.tsx">
                GeoData Loader
              </h1>
              <p className="text-xs text-gray-500" data-id="b52zbh8rj" data-path="src/components/layout/Header.tsx">Geospatial Data Processing Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4" data-id="st34yxo7b" data-path="src/components/layout/Header.tsx">
            <DropdownMenu data-id="ub0yumrt0" data-path="src/components/layout/Header.tsx">
              <DropdownMenuTrigger asChild data-id="mkmv75i5f" data-path="src/components/layout/Header.tsx">
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50" data-id="efne00mnv" data-path="src/components/layout/Header.tsx">
                  <Avatar className="h-8 w-8" data-id="6aeh0gmsu" data-path="src/components/layout/Header.tsx">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} data-id="x348q8sbv" data-path="src/components/layout/Header.tsx" />
                    <AvatarFallback data-id="oparsmwl4" data-path="src/components/layout/Header.tsx">
                      <User className="h-4 w-4" data-id="k9wdhb2rn" data-path="src/components/layout/Header.tsx" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left" data-id="91jd5bmhm" data-path="src/components/layout/Header.tsx">
                    <p className="text-sm font-medium text-gray-900" data-id="hcmlkid6y" data-path="src/components/layout/Header.tsx">{user?.displayName}</p>
                    <p className="text-xs text-gray-500" data-id="sobld1uok" data-path="src/components/layout/Header.tsx">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" data-id="p0scwowra" data-path="src/components/layout/Header.tsx">
                <DropdownMenuItem onClick={signOut} className="text-red-600 hover:text-red-700 hover:bg-red-50" data-id="2pdo83mx6" data-path="src/components/layout/Header.tsx">
                  <LogOut className="mr-2 h-4 w-4" data-id="4h9tvv32i" data-path="src/components/layout/Header.tsx" />
                  <span data-id="v268fevlp" data-path="src/components/layout/Header.tsx">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>);

};

export default Header;