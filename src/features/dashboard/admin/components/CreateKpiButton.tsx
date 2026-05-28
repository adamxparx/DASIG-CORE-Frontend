import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';

interface CreateKpiButtonProps {
  onClick: () => void;
}

const CreateKpiButton = ({ onClick }: CreateKpiButtonProps) => {
  return (
    <Button variant="contained" startIcon={<AddIcon />} onClick={onClick}>
      Create KPI
    </Button>
  );
};

export default CreateKpiButton;
