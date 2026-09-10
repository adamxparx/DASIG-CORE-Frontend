import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { kpiSubmissionService } from '../../kpisubmission/api/kpiSubmissionService';
import type { SubmissionDocumentResponse, KpiSubmissionResponse } from '../../kpisubmission/types/kpiSubmission.types';
import type { ReportCitation } from '../types/report.types';

interface SubmissionDetailDrawerProps {
  citation: ReportCitation | null;
  open: boolean;
  onClose: () => void;
}

const formatDate = (isoDate?: string) =>
  isoDate ? new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

const formatDateTime = (isoDateTime?: string) =>
  isoDateTime
    ? new Date(isoDateTime).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

// The full reportingPeriod value is "Due by <date>" for one-time KPIs (a "Due:" label already
// precedes it) and a bare period label ("Q1 2026", "2026", "Jun 2026") for recurring ones.
const stripDuePrefix = (period: string) => period.replace(/^Due by\s+/i, '');

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const detailRowSx = { justifyContent: 'space-between', alignItems: 'center' } as const;
const labelSx = { fontWeight: 500 } as const;
const valueSx = { fontWeight: 700, color: 'text.primary' } as const;

export default function SubmissionDetailDrawer({ citation, open, onClose }: SubmissionDetailDrawerProps) {
  const [submission, setSubmission] = useState<KpiSubmissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<number | null>(null);
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !citation) {
      return;
    }

    let cancelled = false;

    const loadSubmission = async () => {
      setSubmission(null);
      setError(null);
      setIsLoading(true);
      try {
        const response = await kpiSubmissionService.getSubmissionById(citation.submissionId);
        if (!cancelled) setSubmission(response);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load submission details.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadSubmission();

    return () => {
      cancelled = true;
    };
  }, [open, citation]);

  const handleDownload = async (document: SubmissionDocumentResponse) => {
    if (!citation) return;
    setDownloadingDocumentId(document.id);
    try {
      const blob = await kpiSubmissionService.downloadSubmissionDocumentAsAdmin(citation.submissionId, document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download this document.');
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const handleView = async (document: SubmissionDocumentResponse) => {
    if (!citation) return;
    setViewingDocumentId(document.id);
    try {
      const blob = await kpiSubmissionService.downloadSubmissionDocumentAsAdmin(citation.submissionId, document.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      // Give the new tab time to load the blob before releasing it.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open this document.');
    } finally {
      setViewingDocumentId(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: { xs: '100%', sm: 440 }, bgcolor: 'background.paper' } },
      }}
    >
      {citation && (
        <Stack sx={{ height: '100%' }}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', p: 2.5, pb: 2 }}>
            <Stack spacing={0.25}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.2rem', letterSpacing: '-0.3px' }}
              >
                Submission Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {citation.submissionReference}
              </Typography>
            </Stack>
            <IconButton
              onClick={onClose}
              aria-label="close"
              sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <CloseIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Stack>

          <Divider />

          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            {isLoading && (
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Stack>
            )}

            {!isLoading && error && (
              <Typography variant="body2" sx={{ color: '#B91C1C', fontWeight: 600, bgcolor: '#FEE2E2', p: 1.5, borderRadius: 2 }}>
                {error}
              </Typography>
            )}

            {!isLoading && !error && submission && (
              <Stack spacing={3}>
                <Stack spacing={0.5}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.15rem', lineHeight: 1.3 }}>
                    {submission.kpiName}
                  </Typography>
                  {submission.organizationName && (
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {submission.organizationName}
                    </Typography>
                  )}
                </Stack>

                <Stack
                  spacing={1.75}
                  sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: '#F9FAF8' }}
                >
                  <Stack direction="row" sx={detailRowSx}>
                    <Typography variant="body2" color="text.secondary" sx={labelSx}>
                      Due:
                    </Typography>
                    <Typography variant="body1" sx={valueSx}>
                      {stripDuePrefix(submission.reportingPeriod)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={detailRowSx}>
                    <Typography variant="body2" color="text.secondary" sx={labelSx}>
                      Submitted Value:
                    </Typography>
                    <Typography variant="body1" sx={valueSx}>
                      {submission.submittedValue} (target {citation.targetValue})
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={detailRowSx}>
                    <Typography variant="body2" color="text.secondary" sx={labelSx}>
                      Achievement Rate:
                    </Typography>
                    <Typography variant="body1" sx={valueSx}>
                      {submission.achievementRate.toFixed(1)}%
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={detailRowSx}>
                    <Typography variant="body2" color="text.secondary" sx={labelSx}>
                      Submission Date:
                    </Typography>
                    <Typography variant="body1" sx={valueSx}>
                      {formatDate(submission.submissionDate)}
                    </Typography>
                  </Stack>

                  {submission.submittedByName && (
                    <Stack direction="row" sx={detailRowSx}>
                      <Typography variant="body2" color="text.secondary" sx={labelSx}>
                        Submitted By:
                      </Typography>
                      <Typography variant="body1" sx={valueSx}>
                        {submission.submittedByName}
                      </Typography>
                    </Stack>
                  )}

                  {submission.reviewedByName && (
                    <Stack direction="row" sx={detailRowSx}>
                      <Typography variant="body2" color="text.secondary" sx={labelSx}>
                        Approved By:
                      </Typography>
                      <Typography variant="body1" sx={valueSx}>
                        {submission.reviewedByName}
                      </Typography>
                    </Stack>
                  )}

                  {submission.reviewedAt && (
                    <Stack direction="row" sx={detailRowSx}>
                      <Typography variant="body2" color="text.secondary" sx={labelSx}>
                        Approved At:
                      </Typography>
                      <Typography variant="body1" sx={valueSx}>
                        {formatDateTime(submission.reviewedAt)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                {submission.notes && (
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                    >
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                      {submission.notes}
                    </Typography>
                  </Stack>
                )}

                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    Supporting Documents
                  </Typography>
                  {submission.documents.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No supporting documents uploaded.
                    </Typography>
                  )}
                  <Stack spacing={1}>
                    {submission.documents.map((document) => (
                      <Paper
                        key={document.id}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 2.5, borderColor: 'divider' }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: '#EEF0FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <DescriptionOutlinedIcon sx={{ color: '#6366F1', fontSize: 18 }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                              {document.fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(document.fileSize)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            aria-label={`View ${document.fileName}`}
                            onClick={() => void handleView(document)}
                            disabled={viewingDocumentId === document.id}
                            sx={{ color: 'text.secondary' }}
                          >
                            {viewingDocumentId === document.id ? (
                              <CircularProgress size={18} />
                            ) : (
                              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label={`Download ${document.fileName}`}
                            onClick={() => void handleDownload(document)}
                            disabled={downloadingDocumentId === document.id}
                            sx={{ color: 'text.secondary' }}
                          >
                            {downloadingDocumentId === document.id ? (
                              <CircularProgress size={18} />
                            ) : (
                              <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Box>
        </Stack>
      )}
    </Drawer>
  );
}
