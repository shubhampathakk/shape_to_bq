
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Upload, Database } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" data-id="x6dtkc93k" data-path="src/components/auth/LoginPage.tsx">
      <div className="w-full max-w-4xl" data-id="wdsddwnsj" data-path="src/components/auth/LoginPage.tsx">
        <div className="text-center mb-8" data-id="x9q7xgmcc" data-path="src/components/auth/LoginPage.tsx">
          <div className="flex items-center justify-center mb-4" data-id="u0qxqgr2w" data-path="src/components/auth/LoginPage.tsx">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full" data-id="je13va4jx" data-path="src/components/auth/LoginPage.tsx">
              <MapPin className="h-8 w-8 text-white" data-id="ums1v8qaw" data-path="src/components/auth/LoginPage.tsx" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-id="4qantcuff" data-path="src/components/auth/LoginPage.tsx">
            GeoData Loader
          </h1>
          <p className="text-lg text-gray-600 mt-2" data-id="iim7pjyql" data-path="src/components/auth/LoginPage.tsx">
            Seamlessly upload and process geospatial data to BigQuery
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center" data-id="c0pswoday" data-path="src/components/auth/LoginPage.tsx">
          <Card className="border-0 shadow-xl" data-id="x0r9vyf53" data-path="src/components/auth/LoginPage.tsx">
            <CardHeader className="text-center" data-id="d1ixwaoh6" data-path="src/components/auth/LoginPage.tsx">
              <CardTitle className="text-2xl" data-id="tgge6f25v" data-path="src/components/auth/LoginPage.tsx">Welcome Back</CardTitle>
              <CardDescription data-id="es9bea0g6" data-path="src/components/auth/LoginPage.tsx">
                Sign in to start processing your geospatial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" data-id="asyiccdrj" data-path="src/components/auth/LoginPage.tsx">
              <Button
                onClick={signIn}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" data-id="8eonv7n1b" data-path="src/components/auth/LoginPage.tsx">

                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" data-id="plyneqst3" data-path="src/components/auth/LoginPage.tsx">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" data-id="z8w0v5bf2" data-path="src/components/auth/LoginPage.tsx" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" data-id="e48mqnl6u" data-path="src/components/auth/LoginPage.tsx" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" data-id="5r1k6lqsi" data-path="src/components/auth/LoginPage.tsx" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" data-id="2jdz23v4s" data-path="src/components/auth/LoginPage.tsx" />
                </svg>
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
              
              <div className="text-center" data-id="0ptb6lj93" data-path="src/components/auth/LoginPage.tsx">
                <p className="text-sm text-gray-500" data-id="wnmh1jd5d" data-path="src/components/auth/LoginPage.tsx">
                  Secure authentication powered by Google
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6" data-id="q6ui96ckh" data-path="src/components/auth/LoginPage.tsx">
            <div className="text-center" data-id="fseao2zxt" data-path="src/components/auth/LoginPage.tsx">
              <h2 className="text-2xl font-bold text-gray-800 mb-4" data-id="xypvj2drn" data-path="src/components/auth/LoginPage.tsx">
                Powerful Features
              </h2>
            </div>
            
            <div className="space-y-4" data-id="zejxqvvzn" data-path="src/components/auth/LoginPage.tsx">
              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm" data-id="rtqv8ragi" data-path="src/components/auth/LoginPage.tsx">
                <div className="bg-blue-100 p-2 rounded-full" data-id="7ankxvnh4" data-path="src/components/auth/LoginPage.tsx">
                  <Upload className="h-5 w-5 text-blue-600" data-id="5hftkdrqh" data-path="src/components/auth/LoginPage.tsx" />
                </div>
                <div data-id="ro0y2z71h" data-path="src/components/auth/LoginPage.tsx">
                  <h3 className="font-semibold text-gray-800" data-id="fx09p1rt2" data-path="src/components/auth/LoginPage.tsx">Easy Upload</h3>
                  <p className="text-sm text-gray-600" data-id="gqh1sz0h5" data-path="src/components/auth/LoginPage.tsx">
                    Upload shapefiles directly or specify Google Cloud Storage paths
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm" data-id="8gl0gpab7" data-path="src/components/auth/LoginPage.tsx">
                <div className="bg-purple-100 p-2 rounded-full" data-id="ir3vdv5ym" data-path="src/components/auth/LoginPage.tsx">
                  <Database className="h-5 w-5 text-purple-600" data-id="fs0xgfvtf" data-path="src/components/auth/LoginPage.tsx" />
                </div>
                <div data-id="1yxh9yr0s" data-path="src/components/auth/LoginPage.tsx">
                  <h3 className="font-semibold text-gray-800" data-id="k4f4ozkjn" data-path="src/components/auth/LoginPage.tsx">BigQuery Integration</h3>
                  <p className="text-sm text-gray-600" data-id="vt8tpqdw3" data-path="src/components/auth/LoginPage.tsx">
                    Seamlessly load processed data into Google BigQuery tables
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm" data-id="1kuf66mfs" data-path="src/components/auth/LoginPage.tsx">
                <div className="bg-green-100 p-2 rounded-full" data-id="ju0lkr7y8" data-path="src/components/auth/LoginPage.tsx">
                  <MapPin className="h-5 w-5 text-green-600" data-id="bd5lubt6j" data-path="src/components/auth/LoginPage.tsx" />
                </div>
                <div data-id="m79gr748l" data-path="src/components/auth/LoginPage.tsx">
                  <h3 className="font-semibold text-gray-800" data-id="ed2oyfq4g" data-path="src/components/auth/LoginPage.tsx">Real-time Tracking</h3>
                  <p className="text-sm text-gray-600" data-id="xq5rzl5zd" data-path="src/components/auth/LoginPage.tsx">
                    Monitor processing status and view detailed logs in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default LoginPage;