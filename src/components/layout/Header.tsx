
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm" data-id="4i1st0en8" data-path="src/components/layout/Header.tsx">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="jv158g0zd" data-path="src/components/layout/Header.tsx">
        <div className="flex justify-between items-center h-16" data-id="ozna27ije" data-path="src/components/layout/Header.tsx">
          <div className="flex items-center space-x-3" data-id="k5nkumwmp" data-path="src/components/layout/Header.tsx">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full" data-id="b2aa2mnsk" data-path="src/components/layout/Header.tsx">
              <MapPin className="h-6 w-6 text-white" data-id="jaw501nlh" data-path="src/components/layout/Header.tsx" />
            </div>
            <div data-id="bu8nk9xlq" data-path="src/components/layout/Header.tsx">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-id="tve7jikaw" data-path="src/components/layout/Header.tsx">
                GeoData Loader
              </h1>
              <p className="text-xs text-gray-500" data-id="dvk4zwqjz" data-path="src/components/layout/Header.tsx">Geospatial Data Processing Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4" data-id="cpadm6gt9" data-path="src/components/layout/Header.tsx">
            <DropdownMenu data-id="kwb15f4cc" data-path="src/components/layout/Header.tsx">
              <DropdownMenuTrigger asChild data-id="bivlpug58" data-path="src/components/layout/Header.tsx">
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50" data-id="69m6klsmn" data-path="src/components/layout/Header.tsx">
                  <Avatar className="h-8 w-8" data-id="8v2c1d9kd" data-path="src/components/layout/Header.tsx">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} data-id="05tkbnh5b" data-path="src/components/layout/Header.tsx" />
                    <AvatarFallback data-id="y77rnvmrv" data-path="src/components/layout/Header.tsx">
                      <User className="h-4 w-4" data-id="6di4n9mt9" data-path="src/components/layout/Header.tsx" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left" data-id="h8lyhpoqu" data-path="src/components/layout/Header.tsx">
                    <p className="text-sm font-medium text-gray-900" data-id="hba9wq4rc" data-path="src/components/layout/Header.tsx">{user?.displayName}</p>
                    <p className="text-xs text-gray-500" data-id="zh5d8rg53" data-path="src/components/layout/Header.tsx">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" data-id="za4oa6vwv" data-path="src/components/layout/Header.tsx">
                <DropdownMenuItem onClick={signOut} className="text-red-600 hover:text-red-700 hover:bg-red-50" data-id="4fjhmj1w4" data-path="src/components/layout/Header.tsx">
                  <LogOut className="mr-2 h-4 w-4" data-id="ja7bmdciw" data-path="src/components/layout/Header.tsx" />
                  <span data-id="iiesq7yvn" data-path="src/components/layout/Header.tsx">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>);

};

export default Header;