import Button from '@mui/material/Button';

interface SubmitProgressLinkProps {
  onClick: () => void;
}

const SubmitProgressLink = ({ onClick }: SubmitProgressLinkProps) => {
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
      [ Submit Progress Value ]
    </Button>
  );
};

export default SubmitProgressLink;
