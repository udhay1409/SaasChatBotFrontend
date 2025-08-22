import { HeroSection } from "@/components/Home/HeroSection/HeroSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
    </div>
  );
          
}



// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function Home() {
//   const router = useRouter();
//   useEffect(() => {
//     router.replace("/signin");
//   }, [router]);
//   return null;
// }