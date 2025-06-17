import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" data-id="dsbwslpk9" data-path="src/pages/NotFound.tsx">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 p-8" data-id="nl6a0fvg3" data-path="src/pages/NotFound.tsx">

        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }} data-id="2aa3fsoo5" data-path="src/pages/NotFound.tsx">

          <h1 className="text-8xl font-bold text-primary" data-id="oe20wf1m9" data-path="src/pages/NotFound.tsx">404</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4" data-id="1yts2gh9f" data-path="src/pages/NotFound.tsx">

          <h2 className="text-2xl font-semibold tracking-tight" data-id="vo05ttdk8" data-path="src/pages/NotFound.tsx">Page Not Found</h2>
          <p className="text-muted-foreground" data-id="in61cgv0k" data-path="src/pages/NotFound.tsx">
            Sorry, the page you are looking for does not exist or has been removed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }} data-id="he0lou5r8" data-path="src/pages/NotFound.tsx">

          <Button asChild variant="default" size="lg" data-id="vil5a6q6d" data-path="src/pages/NotFound.tsx">
            <a href="/" data-id="vbprguube" data-path="src/pages/NotFound.tsx">Back to Home</a>
          </Button>
        </motion.div>
      </motion.div>
    </div>);

};

export default NotFound;