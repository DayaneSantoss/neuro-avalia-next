import { Quicksand } from "next/font/google"
import Header from "./_components/Header";
import "./_styles/globals.css"
import SideNavigation from "./_components/SideNavigation";

const quicksand = Quicksand({
  subsets: ["latin"],
  display: "swap"
})
// inter, sono, montserrat
export const metadata = {
  title: {
    template: "Neuro Avalia | %s",
    default: "Neuro Avalia"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={`${quicksand.className} antialiased bg-slate-100 text-primary-100 min-h-screen flex flex-col`}>
        <Header/>
        {/* <div className="grid grid-cols-[13rem_1fr] h-full flex-1"> */}
          {/* <SideNavigation/> */}
          <main>{children}</main>
        {/* </div> */}
      </body>
    </html>
  );}
