import React, { useContext } from 'react'
import { SIDE_MANU_DATA } from '../../utils/data';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const SideMenu = ({ activeMenu}) => {

    const { user, clearUser } = useContext(UserContext);

  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      hnadleLogout();
      return;
    }

    navigate(route);
  };

  const hnadleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };
  return <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">

        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || ""}
        </h5>
      </div>

      {SIDE_MANU_DATA.map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-cnter gap-4 text-[15px] ${
            activeMenu == item.label ? "text-white bg-primary" : ""
          } py-3 px-6 rounded-lg mb-3`}
          onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
      ))}
    </div>
}

export default SideMenu
