<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend as ChartLegend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function index(Request $request)
    {
        $period = $request->get('period', 'monthly');
        
        $dateParam = $request->get('date', now()->format('Y-m-d'));
        $monthParam = $request->get('month', now()->format('Y-m'));
        $yearParam = $request->get('year', now()->format('Y'));
        
        switch ($period) {
            case 'daily':
                $startDate = \Carbon\Carbon::parse($dateParam)->format('Y-m-d');
                $endDate = \Carbon\Carbon::parse($dateParam)->format('Y-m-d');
                break;
            case 'yearly':
                $startDate = \Carbon\Carbon::parse($yearParam . '-01-01')->startOfYear()->format('Y-m-d');
                $endDate = \Carbon\Carbon::parse($yearParam . '-01-01')->endOfYear()->format('Y-m-d');
                break;
            case 'custom':
                $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
                $endDate = $request->get('end_date', now()->format('Y-m-d'));
                break;
            case 'monthly':
            default:
                $period = 'monthly';
                $startDate = \Carbon\Carbon::parse($monthParam . '-01')->startOfMonth()->format('Y-m-d');
                $endDate = \Carbon\Carbon::parse($monthParam . '-01')->endOfMonth()->format('Y-m-d');
                break;
        }

        $transactions = $this->reportService->getSalesByPeriod($startDate, $endDate);
        $summary = $this->reportService->getPeriodSummary($startDate, $endDate);
        $topProducts = $this->reportService->getTopProducts(10, $startDate, $endDate);
        $salesByPaymentMethod = $this->reportService->getSalesByPaymentMethod($startDate, $endDate);
        $lowStockProducts = $this->reportService->getLowStockProducts();

        return Inertia::render('Reports/Index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'topProducts' => $topProducts,
            'salesByPaymentMethod' => $salesByPaymentMethod,
            'lowStockProducts' => $lowStockProducts,
            'filters' => [
                'period' => $period,
                'date' => $dateParam,
                'month' => $monthParam,
                'year' => $yearParam,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $period = $request->get('period', 'monthly');
        
        $dateParam = $request->get('date', now()->format('Y-m-d'));
        $monthParam = $request->get('month', now()->format('Y-m'));
        $yearParam = $request->get('year', now()->format('Y'));
        
        switch ($period) {
            case 'daily':
                $startDate = \Carbon\Carbon::parse($dateParam)->format('Y-m-d');
                $endDate = \Carbon\Carbon::parse($dateParam)->format('Y-m-d');
                break;
            case 'yearly':
                $startDate = \Carbon\Carbon::parse($yearParam . '-01-01')->startOfYear()->format('Y-m-d');
                $endDate = \Carbon\Carbon::parse($yearParam . '-01-01')->endOfYear()->format('Y-m-d');
                break;
            case 'custom':
                $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
                $endDate = $request->get('end_date', now()->format('Y-m-d'));
                break;
            case 'monthly':
            default:
                $startDate = \Carbon\Carbon::parse($monthParam . '-01')->startOfMonth()->format('Y-m-d');
                $endDate = \Carbon\Carbon::parse($monthParam . '-01')->endOfMonth()->format('Y-m-d');
                break;
        }

        $transactions = $this->reportService->getSalesByPeriod($startDate, $endDate);

        $response = new StreamedResponse(function () use ($transactions, $period) {
            $spreadsheet = new Spreadsheet();
            
            // ==========================================
            // SHEET 2: DATA TRANSAKSI
            // ==========================================
            $sheet2 = $spreadsheet->getActiveSheet();
            $sheet2->setTitle('Data Transaksi');
            
            // Header Styles
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF15803D'] // green-700
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCCCCCC']],
                ],
            ];

            $headers = ['No', 'Invoice', 'Tanggal', 'Kasir', 'Total', 'Metode Pembayaran', 'Status'];
            $sheet2->fromArray($headers, null, 'A1');
            $sheet2->getStyle('A1:G1')->applyFromArray($headerStyle);
            $sheet2->getRowDimension(1)->setRowHeight(25);

            $row = 2;
            $no = 1;
            foreach ($transactions as $transaction) {
                $sheet2->setCellValue('A' . $row, $no++);
                $sheet2->setCellValue('B' . $row, $transaction->invoice_number);
                $sheet2->setCellValue('C' . $row, $transaction->created_at->format('d/m/Y H:i'));
                $sheet2->setCellValue('D' . $row, $transaction->user->name);
                $sheet2->setCellValue('E' . $row, $transaction->total);
                $sheet2->setCellValue('F' . $row, $transaction->payment_method->label());
                $sheet2->setCellValue('G' . $row, $transaction->status->label());
                $row++;
            }

            // Formatting
            $lastRow = $row - 1;
            if ($lastRow >= 2) {
                $sheet2->getStyle('E2:E' . $lastRow)->getNumberFormat()->setFormatCode('"Rp" #,##0.00_-');
                $sheet2->getStyle('A2:G' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->setColor(new Color('FFEEEEEE'));
                $sheet2->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet2->getStyle('G2:G' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }

            foreach (range('A', 'G') as $col) {
                $sheet2->getColumnDimension($col)->setAutoSize(true);
            }

            // ==========================================
            // SHEET 1: GRAFIK & RINGKASAN
            // ==========================================
            $sheet1 = $spreadsheet->createSheet(0);
            $sheet1->setTitle('Grafik Penjualan');
            $spreadsheet->setActiveSheetIndex(0);

            // Hide Gridlines for clean canvas
            $sheet1->setShowGridlines(false);

            // Group Data for Chart
            $aggregated = [];
            foreach ($transactions->where('status', \App\Enums\TransactionStatus::COMPLETED) as $t) {
                if ($period === 'daily') {
                    $key = $t->created_at->format('H:00');
                } elseif ($period === 'yearly') {
                    $key = $t->created_at->format('M Y');
                } else {
                    $key = $t->created_at->format('d M Y');
                }
                
                if (!isset($aggregated[$key])) {
                    $aggregated[$key] = 0;
                }
                $aggregated[$key] += $t->total;
            }

            // We need chronological order (oldest to newest for chart)
            $aggregated = array_reverse($aggregated, true);

            // Write hidden data for chart far below
            $dataRow = 50; 
            $sheet1->setCellValue('A'.$dataRow, 'Periode');
            $sheet1->setCellValue('B'.$dataRow, 'Pendapatan');
            
            $startDataRow = $dataRow + 1;
            $currentRow = $startDataRow;
            foreach ($aggregated as $label => $total) {
                $sheet1->setCellValue('A'.$currentRow, $label);
                $sheet1->setCellValue('B'.$currentRow, $total);
                $currentRow++;
            }
            $endDataRow = $currentRow - 1;

            if ($endDataRow >= $startDataRow) {
                $dataSeriesLabels = [
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, "'Grafik Penjualan'!\$B\$".$dataRow, null, 1),
                ];
                $xAxisTickValues = [
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, "'Grafik Penjualan'!\$A\$".$startDataRow.":\$A\$".$endDataRow, null, $endDataRow - $startDataRow + 1),
                ];
                $dataSeriesValues = [
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, "'Grafik Penjualan'!\$B\$".$startDataRow.":\$B\$".$endDataRow, null, $endDataRow - $startDataRow + 1),
                ];

                $series = new DataSeries(
                    DataSeries::TYPE_LINECHART,
                    DataSeries::GROUPING_STANDARD,
                    range(0, count($dataSeriesValues) - 1),
                    $dataSeriesLabels,
                    $xAxisTickValues,
                    $dataSeriesValues
                );

                $plotArea = new PlotArea(null, [$series]);
                $legend = new ChartLegend(ChartLegend::POSITION_BOTTOM, null, false);
                $title = new Title('Tren Pendapatan');
                
                $chart = new Chart('chart1', $title, $legend, $plotArea, true, 0, null, null);
                
                $chart->setTopLeftPosition('B2');
                $chart->setBottomRightPosition('K20');
                
                $sheet1->addChart($chart);
            } else {
                $sheet1->setCellValue('B2', 'Tidak ada data transaksi yang selesai pada periode ini.');
                $sheet1->getStyle('B2')->getFont()->setItalic(true)->setColor(new Color('FF888888'));
            }

            // Send output
            $writer = new Xlsx($spreadsheet);
            $writer->setIncludeCharts(true);
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename="laporan-penjualan-' . $startDate . '-' . $endDate . '.xlsx"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }
}