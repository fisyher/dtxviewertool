import { Box, Card, CardContent, Typography } from '@mui/material'

function Viewer() {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Main Viewer
      </Typography>
      This is the main viewer
      {/* <ProTip />*/}
      <Card variant='outlined'>
        <CardContent>
          <Typography variant="h5">
            Card Top
          </Typography>
          <Typography>
            Card Middle
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Viewer