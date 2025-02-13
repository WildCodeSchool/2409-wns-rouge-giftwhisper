import { Outlet } from "react-router-dom";

export function PageLayout() {
  return (
    <body>
      <main>
        <Outlet />
      </main>
    </body>
  );
}
