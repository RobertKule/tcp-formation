"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptProps {
  data: {
    type: "PAIEMENT" | "CAISSE"
    matricule?: string
    nom: string
    beneficiaire?: string
    montant: number
    motif: string
    date: Date
    modePaiement?: string
  }
}

export function PrintReceiptButton({ data }: ReceiptProps) {
  const handlePrint = () => {
    // Create a temporary hidden iframe or div for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Reçu - ${data.nom}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #1a1a1a;
              line-height: 1.5;
            }
            .container { 
              max-width: 800px; 
              margin: 20px auto; 
              border: 2px solid #0f172a;
              padding: 50px;
              border-radius: 4px;
              position: relative;
              background: white;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 150px;
              font-weight: 900;
              color: rgba(15, 23, 42, 0.03);
              z-index: 0;
              pointer-events: none;
              white-space: nowrap;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 4px double #0f172a;
              padding-bottom: 25px;
              margin-bottom: 40px;
              position: relative;
              z-index: 1;
            }
            .logo-section { display: flex; align-items: center; gap: 20px; }
            .logo { width: 80px; height: 80px; object-fit: contain; }
            .company-info { text-align: left; }
            .company-name { font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; line-height: 1.1; }
            .company-tagline { font-size: 12px; color: #64748b; font-weight: 500; }
            
            .receipt-title-box {
              text-align: right;
            }
            .receipt-title { font-size: 32px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; }
            .receipt-no { font-family: monospace; font-size: 14px; color: #64748b; margin-top: 5px; }

            .content { position: relative; z-index: 1; }
            
            .row {
              display: flex;
              border-bottom: 1px solid #f1f5f9;
              padding: 15px 0;
            }
            .row:last-child { border-bottom: none; }
            .col-label { width: 200px; font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .col-value { flex: 1; font-size: 16px; color: #0f172a; font-weight: 600; }
            
            .amount-card {
              margin-top: 40px;
              background: #0f172a;
              color: white;
              padding: 30px;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .amount-words { font-size: 12px; color: #94a3b8; font-style: italic; max-width: 60%; }
            .amount-total { font-size: 36px; font-weight: 900; color: white; }
            .currency { font-size: 18px; font-weight: 400; color: #94a3b8; margin-left: 5px; }
            
            .signature-area {
              margin-top: 80px;
              display: flex;
              justify-content: space-between;
              padding: 0 40px;
            }
            .sig-box { text-align: center; }
            .sig-line { width: 180px; border-top: 2px solid #0f172a; margin-bottom: 10px; }
            .sig-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; }

            .legal-footer {
              margin-top: 60px;
              text-align: center;
              font-size: 10px;
              color: #cbd5e1;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
            }

            @media print {
              body { padding: 0; background: white; }
              .container { border: 2px solid #0f172a; margin: 0; width: 100%; box-sizing: border-box; }
              .amount-card { -webkit-print-color-adjust: exact; background-color: #0f172a !important; color: white !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="watermark">TCP FORMATION</div>
            
            <div class="header">
              <div class="logo-section">
                <img src="/LogoTCP.jpeg" class="logo" />
                <div class="company-info">
                  <div class="company-name">TCP Formation</div>
                  <div class="company-tagline">Technologie & Compétence Professionnelle</div>
                </div>
              </div>
              <div class="receipt-title-box">
                <div class="receipt-title">REÇU</div>
                <div class="receipt-no">REF: ${Math.random().toString(36).substring(7).toUpperCase()}</div>
              </div>
            </div>

            <div class="content">
              <div class="row">
                <div class="col-label">Date de l'opération</div>
                <div class="col-value">${format(data.date, "dd MMMM yyyy", { locale: fr })}</div>
              </div>
              
              <div class="row">
                <div class="col-label">Référence / Matricule</div>
                <div class="col-value">${data.matricule || "N/A"}</div>
              </div>

              <div class="row">
                <div class="col-label">Au nom de</div>
                <div class="col-value">${data.nom}</div>
              </div>

              ${data.beneficiaire ? `
              <div class="row">
                <div class="col-label">Bénéficiaire / Donneur</div>
                <div class="col-value">${data.beneficiaire}</div>
              </div>
              ` : ''}

              <div class="row">
                <div class="col-label">Mode de Paiement</div>
                <div class="col-value">${data.modePaiement || "En espèces (Cash)"}</div>
              </div>

              <div class="row">
                <div class="col-label">Motif du versement</div>
                <div class="col-value">${data.motif}</div>
              </div>

              <div class="amount-card">
                <div class="amount-words">
                  Paiement effectué en Dollars Américains (USD).
                </div>
                <div class="amount-total">
                  ${data.montant.toLocaleString()}<span class="currency">$</span>
                </div>
              </div>
            </div>

            <div class="signature-area">
              <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-label">Signature du Client</div>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-label">Pour la Direction (Cachet)</div>
              </div>
            </div>

            <div class="legal-footer">
              Ce document est un titre de paiement officiel émis par TCP Formation.
              <br/>Généré le ${format(new Date(), "dd/MM/yyyy HH:mm")}
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Button 
      onClick={handlePrint}
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-zinc-400 hover:text-blue-600"
      title="Imprimer le reçu"
    >
      <Printer className="w-4 h-4" />
    </Button>
  );
}
