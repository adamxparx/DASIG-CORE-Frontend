import AppsIcon from '@mui/icons-material/Apps';
import ViewListIcon from '@mui/icons-material/ViewList';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import type { DashboardViewMode } from '../../shared/types/dashboard.types';

interface DashboardViewToggleProps {
  viewMode: DashboardViewMode;
  onChange: (viewMode: DashboardViewMode) => void;
}

const DashboardViewToggle = ({ viewMode, onChange }: DashboardViewToggleProps) => {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(_, value: DashboardViewMode | null) => {
        if (value) {
          onChange(value);
        }
      }}
      size="small"
    >
      <Tooltip title="Grid view">
        <ToggleButton value="grid">
          <AppsIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="List view">
        <ToggleButton value="list">
          <ViewListIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

export default DashboardViewToggle;
