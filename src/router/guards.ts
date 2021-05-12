import jwt from 'jsonwebtoken';
import { NavigationGuard } from 'vue-router';

function getCookie(cname: string) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');

  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];

    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
}

const loginRoute = { name: 'AuthLogin' };
const omitRoutes = [
  'AuthLogin',
  'PasswordSetup',
];

const authGuard: NavigationGuard = (to, from, next) => {
  const token = localStorage.getItem('token');

  if (!token && !omitRoutes.includes(to.name ?? '')) next(loginRoute);
  else {
    const tokenExpiration = token && jwt.decode(token) as { [key: string]: any; };

    if (tokenExpiration && Date.now() >= parseInt(tokenExpiration.exp, 10) * 1000) {
      localStorage.removeItem('token');
      next(loginRoute);
    } else {
      next();
    }
  }
};

// export const devGuard: NavigationGuard = (to, from, next) => {
//   if (to.name === 'test-route' && !!getCookie('dev-mode')) {
//     next();
//   } else if (to.name === 'AuthLogin') {
//     next();
//   } else {
//     next(from.name ? { name: from.name } : loginRoute);
//   }
// };

export default authGuard;
