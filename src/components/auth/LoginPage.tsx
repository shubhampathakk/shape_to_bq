
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Upload, Database } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" data-id="uhkvjvguw" data-path="src/components/auth/LoginPage.tsx">
      <div className="w-full max-w-4xl" data-id="dm3hpparl" data-path="src/components/auth/LoginPage.tsx">
        <div className="text-center mb-8" data-id="v4w1psali" data-path="src/components/auth/LoginPage.tsx">
          <div className="flex items-center justify-center mb-4" data-id="zqe40b5hz" data-path="src/components/auth/LoginPage.tsx">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full" data-id="7ixdu8tdu" data-path="src/components/auth/LoginPage.tsx">
              <MapPin className="h-8 w-8 text-white" data-id="rk4q16ng6" data-path="src/components/auth/LoginPage.tsx" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-id="mqvcu2vx3" data-path="src/components/auth/LoginPage.tsx">
            GeoData Loader
          </h1>
          <p className="text-lg text-gray-600 mt-2" data-id="tle7ge3vr" data-path="src/components/auth/LoginPage.tsx">
            Seamlessly upload and process geospatial data to BigQuery
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center" data-id="s39wjth30" data-path="src/components/auth/LoginPage.tsx">
          <Card className="border-0 shadow-xl" data-id="hxgvkzn0f" data-path="src/components/auth/LoginPage.tsx">
            <CardHeader className="text-center" data-id="idagvg3u9" data-path="src/components/auth/LoginPage.tsx">
              <CardTitle className="text-2xl" data-id="bx5d8cvec" data-path="src/components/auth/LoginPage.tsx">Welcome Back</CardTitle>
              <CardDescription data-id="1my6qp4z9" data-path="src/components/auth/LoginPage.tsx">
                Sign in to start processing your geospatial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" data-id="maob1ltpb" data-path="src/components/auth/LoginPage.tsx">
              <Button
                onClick={signIn}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" data-id="ktt3m7r5f" data-path="src/components/auth/LoginPage.tsx">

                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" data-id="3fuo1w5xo" data-path="src/components/auth/LoginPage.tsx">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" data-id="uq12dr95z" data-path="src/components/auth/LoginPage.tsx" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" data-id="p9kifkul9" data-path="src/components/auth/LoginPage.tsx" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" data-id="1e6g81omt" data-path="src/components/auth/LoginPage.tsx" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" data-id="ycs6augwv" data-path="src/components/auth/LoginPage.tsx" />
                </svg>
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </Button>
              
              <div className="text-center" data-id="4oqp0yv04" data-path="src/components/auth/LoginPage.tsx">
                <p className="text-sm text-gray-500" data-id="2d7sbfm9g" data-path="src/components/auth/LoginPage.tsx">
                  Secure authentication powered by Google
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6" data-id="c9wsu1c6b" data-path="src/components/auth/LoginPage.tsx">
            <div className="text-center" data-id="t4qzozkot" data-path="src/components/auth/LoginPage.tsx">
              <h2 className="text-2xl font-bold text-gray-800 mb-4" data-id="9y54hbb7p" data-path="src/components/auth/LoginPage.tsx">
                Powerful Features
              </h2>
            </div>
            
            <div className="space-y-4" data-id="jqy0t9zoc" data-path="src/components/auth/LoginPage.tsx">
              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm" data-id="28jyi3jik" data-path="src/components/auth/LoginPage.tsx">
                <div className="bg-blue-100 p-2 rounded-full" data-id="g60qjlnvg" data-path="src/components/auth/LoginPage.tsx">
                  <Upload className="h-5 w-5 text-blue-600" data-id="v2yic6v2l" data-path="src/components/auth/LoginPage.tsx" />
                </div>
                <div data-id="lhbzg1qme" data-path="src/components/auth/LoginPage.tsx">
                  <h3 className="font-semibold text-gray-800" data-id="oqclfkmd8" data-path="src/components/auth/LoginPage.tsx">Easy Upload</h3>
                  <p className="text-sm text-gray-600" data-id="idyhqtmzm" data-path="src/components/auth/LoginPage.tsx">
                    Upload shapefiles directly or specify Google Cloud Storage paths
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm" data-id="v1yl56h2s" data-path="src/components/auth/LoginPage.tsx">
                <div className="bg-purple-100 p-2 rounded-full" data-id="o2khohs0p" data-path="src/components/auth/LoginPage.tsx">
                  <Database className="h-5 w-5 text-purple-600" data-id="xyirhyskh" data-path="src/components/auth/LoginPage.tsx" />
                </div>
                <div data-id="vfh9tjmb2" data-path="src/components/auth/LoginPage.tsx">
                  <h3 className="font-semibold text-gray-800" data-id="jbm3j25et" data-path="src/components/auth/LoginPage.tsx">BigQuery Integration</h3>
                  <p className="text-sm text-gray-600" data-id="qjpwdv7gr" data-path="src/components/auth/LoginPage.tsx">
                    Seamlessly load processed data into Google BigQuery tables
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm" data-id="ihi2bq4xw" data-path="src/components/auth/LoginPage.tsx">
                <div className="bg-green-100 p-2 rounded-full" data-id="y105zgskq" data-path="src/components/auth/LoginPage.tsx">
                  <MapPin className="h-5 w-5 text-green-600" data-id="mpcx4ei53" data-path="src/components/auth/LoginPage.tsx" />
                </div>
                <div data-id="9dh6wxgc9" data-path="src/components/auth/LoginPage.tsx">
                  <h3 className="font-semibold text-gray-800" data-id="sxs88oxef" data-path="src/components/auth/LoginPage.tsx">Real-time Tracking</h3>
                  <p className="text-sm text-gray-600" data-id="asqpdylca" data-path="src/components/auth/LoginPage.tsx">
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