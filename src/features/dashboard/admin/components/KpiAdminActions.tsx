import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

interface KpiAdminActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  isArchived?: boolean;
}

const KpiAdminActions = ({
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  isArchived = false,
}: KpiAdminActionsProps) => {
  return (
    <Stack direction="row" spacing={0.5}>
      {!isArchived && onEdit && (
        <Tooltip title="Edit KPI">
          <IconButton size="small" onClick={onEdit} color="primary">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {!isArchived && onArchive && (
        <Tooltip title="Archive KPI">
          <IconButton size="small" onClick={onArchive} sx={{ color: '#1A73E8' }}>
            <ArchiveOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {isArchived && onUnarchive && (
        <Tooltip title="Restore KPI">
          <IconButton size="small" onClick={onUnarchive} sx={{ color: '#1E8E3E' }}>
            <UnarchiveOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title="Delete KPI">
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

export default KpiAdminActions;
