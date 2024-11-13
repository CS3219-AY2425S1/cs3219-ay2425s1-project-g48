import { ReactNode } from "react";

/**
 * Wrapper for a new page
 */
const Page = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67] text-white p-10">
      {children}
    </div>
  );
};

export default Page;
