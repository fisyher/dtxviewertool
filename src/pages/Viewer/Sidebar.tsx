import { Drawer, List, ListItem, ListItemButton, ListItemIcon, Toolbar } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import MailIcon from "@mui/icons-material/Mail";
import AddTaskIcon from "@mui/icons-material/AddTask";
import AddchartIcon from "@mui/icons-material/Addchart";
import { useState } from "react";

const drawerWidth: number = 55;

interface SidebarProps {
    callback: Function;
}

const Sidebar: React.FC<SidebarProps> = ({ callback }) => {
    const [sidebarTab, setSidebarTab] = useState(0);

    const handleSidebarClick = (newValue: number) => {
        setSidebarTab(newValue);
        callback(newValue);
    };

    //Toolbar is used only to fill up the space that overlap with the Top AppBar
    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" }
            }}
        >
            <Toolbar />
            <List>
                <ListItem disableGutters>
                    <ListItemButton dense onClick={() => handleSidebarClick(0)}>
                        <ListItemIcon>
                            <InboxIcon sx={sidebarTab === 0 ? { color: "#fb8c00" } : {}} />
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
                <ListItem disableGutters>
                    <ListItemButton dense onClick={() => handleSidebarClick(1)}>
                        <ListItemIcon>
                            <MailIcon sx={sidebarTab === 1 ? { color: "#fb8c00" } : {}} />
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
                <ListItem disableGutters>
                    <ListItemButton dense onClick={() => handleSidebarClick(2)}>
                        <ListItemIcon>
                            <AddTaskIcon sx={sidebarTab === 2 ? { color: "#fb8c00" } : {}} />
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
                <ListItem disableGutters>
                    <ListItemButton dense onClick={() => handleSidebarClick(3)}>
                        <ListItemIcon>
                            <AddchartIcon sx={sidebarTab === 3 ? { color: "#fb8c00" } : {}} />
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;
