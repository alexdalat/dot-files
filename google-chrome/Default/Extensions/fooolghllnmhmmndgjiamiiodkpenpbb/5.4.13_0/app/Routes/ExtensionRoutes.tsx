import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@extension/common/constants/routes';
import { PrivateRoute } from '@extension/app/Routes/PrivateRoute';
import { PublicRoute } from '@extension/app/Routes/PublicRoute';
import { ValidateMasterPassword } from '@extension/app/pages/ValidateMasterPassword';
import { Vault } from '@extension/app/pages/Vault';
import { PasswordGenerator } from '@extension/app/pages/PasswordGenerator/PasswordGenerator';
import { Tools } from '@extension/app/pages/Tools/Tools';
import { Trash } from '@extension/app/pages/Trash/Trash';
import { Profile } from '@extension/app/pages/Profile/Profile';
import { UserSwitch } from '@extension/app/pages/MasterPasswordUserSwitch/MasterPasswordUserSwitch';

export const ExtensionRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="validate-master-password" element={<ValidateMasterPassword />} />
    </Route>

    <Route element={<PublicRoute simpleLayout />}>
      <Route path="mp-switch-account" element={<UserSwitch />} />
    </Route>

    <Route element={<PrivateRoute />}>
      <Route path="vault/*" element={<Vault />} />
      <Route path="trash/*" element={<Trash />} />
    </Route>

    <Route element={<PrivateRoute hideHeader />}>
      <Route path="generate-password" element={<PasswordGenerator />} />
      <Route path="tools" element={<Tools />} />
      <Route path="profile" element={<Profile />} />
    </Route>

    <Route path="*" element={<Navigate replace to={ROUTES.VALIDATE_MASTER} />} />
  </Routes>
);
