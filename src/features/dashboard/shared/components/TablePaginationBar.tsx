import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const TABLE_PAGE_SIZE = 6;

interface TablePaginationBarProps {
  total: number;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

const TablePaginationBar = ({ total, page, pageSize = TABLE_PAGE_SIZE, onPageChange }: TablePaginationBarProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <>
      <Divider sx={{ borderColor: '#EEF0F4' }} />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ px: 2.5, py: 2, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="body2" sx={{ color: '#9BA1AE', fontSize: '0.8125rem', lineHeight: 1.6 }}>
          Showing {start} to {end} of {total} entries
        </Typography>

        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Button
            size="small"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            sx={{
              textTransform: 'none',
              minWidth: 72,
              px: 1.5,
              py: 0.65,
              borderRadius: 1.5,
              border: '1px solid #E2E5EC',
              color: page === 1 ? '#C4C9D4' : '#6B7280',
              fontWeight: 500,
              fontSize: '0.8125rem',
              bgcolor: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#F9FAFB', boxShadow: 'none' },
            }}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              size="small"
              onClick={() => onPageChange(pageNumber)}
              sx={{
                minWidth: 34,
                width: 34,
                height: 34,
                p: 0,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: page === pageNumber ? '#fff' : '#6B7280',
                bgcolor: page === pageNumber ? '#6366F1' : '#fff',
                border: page === pageNumber ? 'none' : '1px solid #E2E5EC',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: page === pageNumber ? '#5558E3' : '#F9FAFB',
                  boxShadow: 'none',
                },
              }}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            size="small"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            sx={{
              textTransform: 'none',
              minWidth: 60,
              px: 1.5,
              py: 0.65,
              borderRadius: 1.5,
              border: '1px solid #E2E5EC',
              color: page === totalPages ? '#C4C9D4' : '#6B7280',
              fontWeight: 500,
              fontSize: '0.8125rem',
              bgcolor: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#F9FAFB', boxShadow: 'none' },
            }}
          >
            Next
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default TablePaginationBar;
