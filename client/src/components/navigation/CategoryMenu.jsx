import { useState, useEffect } from "react";
import Menu from '@mui/material/Menu';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function CategoryMenu({ category }) {
    const navigate = useNavigate();

    const [categoryData, setCategoryData] = useState([]);
    useEffect(() => {
        if (category){
            let parsedCat = JSON.parse(category);
            console.log(parsedCat)
            setCategoryData(parsedCat);
        }
    }, [category]);

    // Main Menus
    const [mainMenuEl, setMainMenuEl] = useState(null);
    const openMainMenu = Boolean(mainMenuEl);
    const handleMainMenu = (event) => {
        setMainMenuEl(event.currentTarget);
    };
    const handleMainMenuClose = () => {
        setMainMenuEl(null);
    };

    // Sub Menu
    const [subMenuEl, setSubMenuEl] = useState(null);
    const [subMenuKey, setSubMenuKey] = useState(null);
    const openSubMenu = Boolean(subMenuEl);
    const handleSubMenu = (event, key) => {
        setSubMenuKey(key)
        setSubMenuEl(event.currentTarget);
    };
    const handleSubMenuClose = () => {
        setSubMenuEl(null);
    };

    return (
        <>
        <div
        className='hover:bg-zinc-300 px-2 cursor-pointer ml-2 z-50 flex items-center'
        aria-controls={openMainMenu ? 'main-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openMainMenu ? 'true' : undefined}
        onClick={handleMainMenu}>
            {categoryData? 
            <span className="uppercase text-[0.75rem] md:text-[1rem]">{categoryData.genre}</span>
            : null }
        </div>
        <Menu
        PaperProps={{ sx: { borderRadius: 0 } }}
        MenuListProps={{ sx: { py: 0 } }}
        anchorEl={mainMenuEl}
        open={openMainMenu}
        onClose={handleMainMenuClose}>
            <div className="flex flex-col">
                <div 
                className="p-2 border-b-2 border-green-500/20 bg-green-200 hover:bg-green-300 cursor-pointer" 
                onClick={() => navigate(`${categoryData.genre}/season`)}>
                    <span className="uppercase text-sm">
                        Season
                    </span>
                </div>
                <div 
                className="p-2 border-b-2 border-zinc-400 hover:bg-zinc-300 cursor-pointer" 
                onClick={() => navigate(`${categoryData.genre}`)}>
                    <span className="uppercase text-sm">
                        All
                    </span>
                </div>
                {categoryData && categoryData.classes ? 
                categoryData.classes.map(subcategory => (
                <div key={subcategory.id}>
                    <div   
                    className='hover:bg-zinc-300 cursor-pointer p-2 border-b-2 border-zinc-400'
                    aria-controls={openSubMenu ? subcategory.name : undefined}
                    aria-haspopup="true"
                    aria-expanded={openSubMenu ? 'true' : undefined}
                    onClick={(event) => handleSubMenu(event, subcategory.name)}>
                        <span className="uppercase text-sm">
                            {subcategory.name}
                        </span>
                    </div>
                    <Menu
                    PaperProps={{ sx: { borderRadius: 0 } }}
                    MenuListProps={{ sx: { py: 0 } }}
                    id={subcategory.name}
                    anchorEl={subMenuEl}
                    open={openSubMenu && subMenuKey === subcategory.name}
                    onClose={handleSubMenuClose}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}>
                        <div className="flex flex-col">
                            <div 
                            className="p-2 border-b-2 border-zinc-400 cursor-pointer hover:bg-zinc-300"
                            onClick={() => navigate(`${categoryData.genre}/${subcategory.name}`)}>
                                <span className="uppercase text-sm">All</span>
                            </div>
                            {subcategory.types.map((type, index) => (
                                <div 
                                key={index} 
                                className="p-2 border-b-2 border-zinc-400 cursor-pointer hover:bg-zinc-300"
                                onClick={() => navigate(`${categoryData.genre}/${subcategory.name}/${type}`)}>
                                    <span className="uppercase text-sm">{type}</span>
                                </div>
                            ))}
                        </div>
                    </Menu>
                </div>
                ))
                : null}
            </div>
        </Menu>
        </>
    );
}