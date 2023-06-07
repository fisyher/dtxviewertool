import { css } from "@emotion/react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import MailIcon from "@mui/icons-material/Mail";
import AddTaskIcon from '@mui/icons-material/AddTask';
import AddchartIcon from '@mui/icons-material/Addchart';

const drawerWidth: number = 55;

const Sidebar = () => {
  
    //Toolbar is used only to fill up the space that overlap with the Top AppBar
    return (
    <Drawer variant="permanent" anchor="left" sx={{
        width: drawerWidth,
        flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
      }}>
      <Toolbar />
      <List>
        <ListItem disableGutters>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <ListItem disableGutters>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            
          </ListItemButton>
        </ListItem>
        <ListItem disableGutters>
          <ListItemButton>
            <ListItemIcon>
              <AddTaskIcon />
            </ListItemIcon>
            
          </ListItemButton>
        </ListItem>
        <ListItem disableGutters>
          <ListItemButton>
            <ListItemIcon>
              <AddchartIcon />
            </ListItemIcon>
            
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
