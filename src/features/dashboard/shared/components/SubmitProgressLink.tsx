import Button from '@mui/material/Button';

interface SubmitProgressLinkProps {
  onClick: () => void;
  label?: string;
}

const SubmitProgressLink = ({ onClick, label = '[ Submit Progress Value ]' }: SubmitProgressLinkProps) => {
  return (
    <Button
      variant="text"
      size="small"
      onClick={onClick}
      sx={{
        color: 'text.primary',
        fontWeight: 500,
        textTransform: 'none',
        minWidth: 'unset',
        px: 0.75,
      }}
    >
      {label}
    </Button>
  );
};

export default SubmitProgressLink;
