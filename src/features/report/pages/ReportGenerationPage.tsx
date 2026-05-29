import DownloadIcon from '@mui/icons-material/Download';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import AdminPageLayout from '../../dashboard/shared/components/AdminPageLayout';
import { kpiService } from '../../dashboard/shared/api/kpiService';
import type { KpiDefinitionResponse } from '../../dashboard/shared/types/kpi.types';
import { organizationService } from '../../organization/api/organizationService';
import type { OrganizationResponse } from '../../organization/types/organization.types';
import { reportService } from '../api/reportService';
import NarrativeReportParser from '../components/NarrativeReportParser';
import type { ReportResponse } from '../types/report.types';


export default function ReportGenerationPage() {
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  
  // Date states
  const [periodFrom, setPeriodFrom] = useState<string>('');
  const [periodTo, setPeriodTo] = useState<string>('');

  // Active Report & loading states
  const [activeReport, setActiveReport] = useState<ReportResponse | null>(null);
  const [historyReports, setHistoryReports] = useState<ReportResponse[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Scope states
  const [reportScope, setReportScope] = useState<'ORGANIZATIONAL' | 'KPI'>('ORGANIZATIONAL');
  const [kpis, setKpis] = useState<KpiDefinitionResponse[]>([]);
  const [selectedKpiId, setSelectedKpiId] = useState<string>('');
  const [isKpisLoading, setIsKpisLoading] = useState(false);

  // Toast notifications
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch KPIs globally when scope is KPI
  useEffect(() => {
    async function loadKpis() {
      if (reportScope !== 'KPI') {
        setKpis([]);
        setSelectedKpiId('');
        return;
      }
      setIsKpisLoading(true);
      try {
        const kpiData = await kpiService.getAllKpiDefinitions();
        setKpis(kpiData);
        if (kpiData.length > 0) {
          const firstKpi = kpiData[0];
          setSelectedKpiId(String(firstKpi.id));
          setSelectedOrgId(String(firstKpi.organizationId));
        } else {
          setSelectedKpiId('');
          setSelectedOrgId('');
        }
      } catch (err) {
        showToast('Failed to load KPI list.');
      } finally {
        setIsKpisLoading(false);
      }
    }
    void loadKpis();
  }, [reportScope]);

  // Load organizations on landing
  useEffect(() => {
    async function loadOrgs() {
      setIsLoadingOrgs(true);
      try {
        const orgData = await organizationService.getAll();
        setOrganizations(orgData);
        if (orgData.length > 0) {
          setSelectedOrgId(String(orgData[0].id));
        }
      } catch (err) {
        showToast('Failed to load incubator list.');
      } finally {
        setIsLoadingOrgs(false);
      }
    }
    void loadOrgs();
  }, []);

  // Fetch report history for selected organization
  const loadHistory = useCallback(async (orgIdStr: string) => {
    if (!orgIdStr) return;
    setIsHistoryLoading(true);
    try {
      const data = await reportService.getByOrganization(parseInt(orgIdStr, 10));
      setHistoryReports(data);
    } catch {
      // Gracefully ignore history errors to keep page interactive
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      void loadHistory(selectedOrgId);
      // Reset active report when switching incubators to avoid visual mismatch
      setActiveReport(null);
    }
  }, [selectedOrgId, loadHistory]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleOrgChange = (event: SelectChangeEvent) => {
    setSelectedOrgId(event.target.value);
  };

  // Generate new report
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !periodFrom || !periodTo || (reportScope === 'KPI' && !selectedKpiId)) {
      showToast('Please select all filter parameters.');
      return;
    }

    setIsGenerating(true);
    setActiveReport(null);

    try {
      let report: ReportResponse;

      if (reportScope === 'ORGANIZATIONAL') {
        report = await reportService.generateOrgReport({
          organizationId: parseInt(selectedOrgId, 10),
          periodFrom,
          periodTo,
        });
      } else {
        report = await reportService.generateKpiReport({
          kpiDefinitionId: parseInt(selectedKpiId, 10),
          periodFrom,
          periodTo,
        });
      }

      if (report.status === 'FAILED') {
        throw new Error(report.narrativeText || 'Failed to generate AI performance narrative.');
      }

      setActiveReport(report);
      showToast('AI Narrative Report generated successfully.');
      void loadHistory(selectedOrgId); // Refresh history log
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to generate performance report.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger authenticated PDF export blob downloader
  const handleExportPdf = async (id: string) => {
    setIsExporting(true);
    try {
      const blob = await reportService.exportPdfBlob(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kpi-performance-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('PDF Performance report exported successfully.');
    } catch (err) {
      showToast('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  // Date formatting helper
  const formatDateRange = (fromStr: string, toStr: string) => {
    const fOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const fromDate = new Date(fromStr).toLocaleDateString('en-US', fOptions);
    const toDate = new Date(toStr).toLocaleDateString('en-US', fOptions);
    return `${fromDate} to ${toDate}`;
  };

  if (isLoadingOrgs) {
    return (
      <AdminPageLayout>
        <Stack sx={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#426ef0' }} />
        </Stack>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <Stack spacing={3.5}>
        {/* Header */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'text.primary',
              color: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              '& svg': { fontSize: 26 },
            }}
          >
            <SummarizeOutlinedIcon />
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
              Report Generation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Generate and export AI-powered performance narrative reports for technology business incubators
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        {/* Primary Content Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          {/* Left Column: Generator Controls Card */}
          <Card
            elevation={0}
            component="form"
            onSubmit={handleGenerate}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3.5,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'text.primary', letterSpacing: '-0.2px' }}>
              AI Generator Options
            </Typography>
            
            <Stack spacing={3}>
              {/* Report Scope Selector */}
              <FormControl component="fieldset">
                <FormLabel id="report-scope-label" sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.secondary', mb: 1 }}>
                  Report Scope
                </FormLabel>
                <RadioGroup
                  aria-labelledby="report-scope-label"
                  name="report-scope"
                  value={reportScope}
                  onChange={(e) => {
                    setReportScope(e.target.value as 'ORGANIZATIONAL' | 'KPI');
                    setActiveReport(null);
                    setPeriodFrom('');
                    setPeriodTo('');
                  }}
                  sx={{ gap: 1 }}
                >
                  <FormControlLabel
                    value="ORGANIZATIONAL"
                    control={<Radio size="small" sx={{ color: '#426ef0', '&.Mui-checked': { color: '#426ef0' } }} />}
                    label={
                      <Typography sx={{ fontSize: '0.92rem', fontWeight: reportScope === 'ORGANIZATIONAL' ? 700 : 500 }}>
                        Organizational Report
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="KPI"
                    control={<Radio size="small" sx={{ color: '#426ef0', '&.Mui-checked': { color: '#426ef0' } }} />}
                    label={
                      <Typography sx={{ fontSize: '0.92rem', fontWeight: reportScope === 'KPI' ? 700 : 500 }}>
                        KPI Performance Report
                      </Typography>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {/* Organization Selector (Only shown for Organizational scope) */}
              {reportScope === 'ORGANIZATIONAL' && (
                <FormControl fullWidth size="small">
                  <InputLabel id="org-selector-label" sx={{ fontWeight: 500 }}>Select Incubator</InputLabel>
                  <Select
                    labelId="org-selector-label"
                    id="org-selector"
                    value={selectedOrgId}
                    label="Select Incubator"
                    onChange={handleOrgChange}
                    sx={{ borderRadius: 2 }}
                  >
                    {organizations.map((org) => (
                      <MenuItem key={org.id} value={String(org.id)}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* KPI Selector (Only shown for KPI Scope) */}
              {reportScope === 'KPI' && (
                <FormControl fullWidth size="small">
                  <InputLabel id="kpi-selector-label" sx={{ fontWeight: 500 }}>Select KPI</InputLabel>
                  <Select
                    labelId="kpi-selector-label"
                    id="kpi-selector"
                    value={selectedKpiId}
                    label="Select KPI"
                    onChange={(e) => {
                      const kpiId = e.target.value;
                      setSelectedKpiId(kpiId);
                      const selectedKpi = kpis.find((k) => String(k.id) === kpiId);
                      if (selectedKpi) {
                        setSelectedOrgId(String(selectedKpi.organizationId));
                      }
                    }}
                    disabled={isKpisLoading || kpis.length === 0}
                    sx={{ borderRadius: 2 }}
                  >
                    {isKpisLoading ? (
                      <MenuItem disabled value="">
                        <CircularProgress size={16} sx={{ mr: 1, color: '#426ef0' }} />
                        Loading KPIs...
                      </MenuItem>
                    ) : kpis.length === 0 ? (
                      <MenuItem disabled value="">
                        No KPIs found
                      </MenuItem>
                    ) : (
                      kpis.map((kpi) => (
                        <MenuItem key={kpi.id} value={String(kpi.id)}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.25 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {kpi.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Incubator: {kpi.organizationName}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}

              {/* Start Date */}
              <TextField
                id="date-from"
                label="Period From"
                type="date"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* End Date */}
              <TextField
                id="date-to"
                label="Period To"
                type="date"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Trigger Button */}
              <Button
                type="submit"
                disabled={isGenerating || !selectedOrgId || !periodFrom || !periodTo || (reportScope === 'KPI' && !selectedKpiId)}
                variant="contained"
                disableElevation
                sx={{
                  bgcolor: '#426ef0',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.25,
                  textTransform: 'none',
                  fontSize: '0.92rem',
                  '&:hover': {
                    bgcolor: '#3054c4',
                  },
                }}
              >
                {isGenerating ? <CircularProgress size={22} color="inherit" /> : 'Generate AI Narrative'}
              </Button>
            </Stack>
          </Card>

          {/* Right Column: Narrative Report Viewer Card */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3.5,
              bgcolor: 'background.paper',
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Loading Indicator */}
            {isGenerating ? (
              <Stack sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', py: 8, textAlign: 'center', spacing: 2 }}>
                <CircularProgress size={40} sx={{ color: '#426ef0', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Generating Narrative...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
                  Groq is currently evaluating the KPI submissions, calculating achievement rates, and constructing your performance executive summary.
                </Typography>
              </Stack>
            ) : activeReport ? (
              // Active Report View
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.45rem', letterSpacing: '-0.3px' }}>
                      {reportScope === 'KPI' ? 'KPI Performance Narrative' : 'Incubator Performance Narrative'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Reporting Period: {formatDateRange(activeReport.periodFrom, activeReport.periodTo)}
                    </Typography>
                  </Stack>

                  <Button
                    onClick={() => handleExportPdf(activeReport.id)}
                    disabled={isExporting}
                    variant="outlined"
                    startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: '#426ef0',
                        bgcolor: 'rgba(66, 110, 240, 0.04)',
                      },
                    }}
                  >
                    Export PDF
                  </Button>
                </Box>

                <Divider />

                <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1 }}>
                  <NarrativeReportParser key={activeReport.id} text={activeReport.narrativeText} />
                </Box>
              </Stack>
            ) : (
              // Empty State
              <Stack sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', py: 8, textAlign: 'center' }}>
                <SummarizeOutlinedIcon sx={{ fontSize: 56, color: 'divider', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  No Report Loaded
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                  Select an incubator, configure a date range on the left, and trigger 'Generate AI Narrative' to generate a report, or select a history record below.
                </Typography>
              </Stack>
            )}
          </Card>
        </Box>

        {/* Historical Reports Section */}
        {selectedOrgId && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.3px' }}>
              Historical Reports Log
            </Typography>

            {isHistoryLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} sx={{ color: '#426ef0' }} />
              </Box>
            ) : historyReports.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3.5,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No historical performance reports found for this incubator organization.
                </Typography>
              </Box>
            ) : (
              <TableContainer
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3.5,
                  bgcolor: 'background.paper',
                  boxShadow: 'none',
                }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="reports history table">
                  <TableHead sx={{ bgcolor: 'secondary.main' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date Generated</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Reporting Period</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', pr: 4 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyReports.map((report) => {
                      const genDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      
                      return (
                        <TableRow key={report.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{genDate}</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {formatDateRange(report.periodFrom, report.periodTo)}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.25,
                                borderRadius: '50px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                bgcolor: report.status === 'GENERATED' ? '#E6F4EA' : '#FCE8E6',
                                color: report.status === 'GENERATED' ? '#137333' : '#C5221F',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {report.status}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3 }}>
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                onClick={() => setActiveReport(report)}
                                variant="text"
                                sx={{ fontWeight: 700, textTransform: 'none' }}
                              >
                                View Narrative
                              </Button>
                              
                              <IconButton
                                size="small"
                                onClick={() => void handleExportPdf(report.id)}
                                title="Download PDF"
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'primary.main', bgcolor: 'rgba(66, 110, 240, 0.04)' },
                                }}
                              >
                                <DownloadIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}
      </Stack>

      {/* Success/Error Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)} sx={{ borderRadius: 3, fontWeight: 600, px: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </AdminPageLayout>
  );
}
