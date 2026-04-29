// import { Show, SignInButton, UserButton } from '@clerk/nextjs';

// export default function HomePage() {
//   return (
//     <main className="p-6">
//       <h1>mongol-atlas</h1>

//       <Show when="signed-out">
//         <SignInButton />
//       </Show>

//       <Show when="signed-in">
//         <UserButton />
//       </Show>
//     </main>
//   );
// }

// //ORGILAS PAGE
// // import AtlasApp from "@/app/components/AtlasApp";

// // export default function HomePage() {
// //   return <AtlasApp  />;
// // }



import { SignInButton, UserButton } from "@clerk/nextjs";
import AtlasApp from "./components/Atlas.app";

export default function HomePage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50 flex gap-3">
        <SignInButton />
        <UserButton />
      </div>

      <AtlasApp />
    </>
  );
}