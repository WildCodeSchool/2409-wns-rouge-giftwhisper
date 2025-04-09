import { Outlet, Link, useLocation } from "react-router-dom";

export function PageLayout() {
  const location = useLocation();
  return (
    <main>
      {location.pathname !== '/chat-window'
        ?
        <ul>
          <li><Link to={'/'}>Home</Link></li>
          <li><Link to={'/sign-in'}>Sign In</Link></li>
          <li><Link to={'/sign-up'}>Sign up</Link></li>
          <li><Link to={'/dashboard'}>Dashboard</Link></li>
          <li><Link to={'/about'}>About</Link></li>
          <li><Link to={'/profile'}>Profile</Link></li>
          <li><Link to={'/settings'}>Settings</Link></li>
          <li><Link to={'/group'}>Group</Link></li>
          <li><Link to={'/group-creation'}>Group Creation</Link></li>
          <li><Link to={'/group-settings'}>Group Settings</Link></li>
          <li><Link to={'/chat-window'}>Chat Windows</Link></li>
        </ul>
        : null
      }
      <Outlet />
    </main>
  );
}
