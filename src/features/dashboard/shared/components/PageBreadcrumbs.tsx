import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

interface PageBreadcrumbsProps {
  items: { label: string; href?: string }[];
}

const PageBreadcrumbs = ({ items }: PageBreadcrumbsProps) => {
  const navigate = useNavigate();

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
      <IconButton
        onClick={() => navigate(-1)}
        size="small"
        sx={{ color: 'text.secondary' }}
      >
        <ArrowBackOutlinedIcon fontSize="small" />
      </IconButton>
      <Breadcrumbs separator="/" sx={{ fontSize: '0.875rem' }}>
        {items.map((item, index) => {
          if (index === items.length - 1) {
            return (
              <Typography key={index} variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {item.label}
              </Typography>
            );
          }
          return (
            <Link
              key={index}
              href={item.href ?? '#'}
              onClick={(e) => {
                e.preventDefault();
                if (item.href) {
                  navigate(item.href);
                }
              }}
              variant="body2"
              sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Stack>
  );
};

export default PageBreadcrumbs;
