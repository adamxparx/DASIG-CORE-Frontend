import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

interface KpiAdminActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const KpiAdminActions = ({ onEdit, onDelete }: KpiAdminActionsProps) => {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Edit KPI">
        <IconButton size="small" onClick={onEdit} color="primary">
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete KPI">
        <IconButton size="small" onClick={onDelete} color="error">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default KpiAdminActions;
