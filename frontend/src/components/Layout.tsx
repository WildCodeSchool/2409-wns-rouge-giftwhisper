import { Outlet, Link } from "react-router-dom";

export function PageLayout() {
  return (
    <body>
      <main>
        <ul>
          <li><Link to={'/'}>Home</Link></li>
          <li><Link to={'/sign-in'}>Sign In</Link></li>
          <li><Link to={'/dashboard'}>Dashboard</Link></li>
          <li><Link to={'/about'}>About</Link></li>
          <li><Link to={'/profile'}>Profile</Link></li>
          <li><Link to={'/settings'}>Settings</Link></li>
          <li><Link to={'/group'}>Group</Link></li>
          <li><Link to={'/group-creation'}>Group Creation</Link></li>
          <li><Link to={'/group-settings'}>Group Settings</Link></li>
          <li><Link to={'/chat-window'}>Chat Windows</Link></li>
        </ul>
        <Outlet />
      </main>
    </body>
  );
}
