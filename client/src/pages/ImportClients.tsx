import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function ImportClients() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const importMutation = trpc.import.clients.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Importação concluída: ${data.created} criados, ${data.updated} atualizados`);
      setFile(null);
      setPreview([]);
    },
    onError: (error) => {
      toast.error("Erro ao importar clientes");
      console.error(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Mostrar preview dos primeiros 5 registros
        setPreview(jsonData.slice(0, 5));
      } catch (error) {
        toast.error("Erro ao ler arquivo");
        console.error(error);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Mapear dados para o formato esperado
          const clients = jsonData.map((row: any) => ({
            farmName: row.farmName || row["Nome da Fazenda"] || "",
            producerName: row.producerName || row["Nome do Produtor"] || "",
            email: row.email || row["E-mail"] || "",
            phone: row.phone || row["Telefone"] || "",
            whatsapp: row.whatsapp || row["WhatsApp"] || "",
            animalType: row.animalType || row["Tipo de Animal"] || "bovinos",
            animalQuantity: parseInt(row.animalQuantity || row["Quantidade de Animais"] || "0"),
            address: row.address || row["Endereço"] || "",
            city: row.city || row["Cidade"] || "",
            state: row.state || row["Estado"] || "",
            zipCode: row.zipCode || row["CEP"] || "",
            notes: row.notes || row["Notas"] || "",
            representanteCodigo: row.representanteCodigo || row["Representante"] || "",
          }));

          importMutation.mutate({ clients });
        } catch (error) {
          toast.error("Erro ao processar arquivo");
          console.error(error);
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      toast.error("Erro ao importar");
      console.error(error);
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Nome da Fazenda": "Fazenda São João",
        "Nome do Produtor": "João Silva",
        "E-mail": "joao@example.com",
        "Telefone": "(11) 3000-0000",
        "WhatsApp": "(11) 99999-9999",
        "Tipo de Animal": "bovinos",
        "Quantidade de Animais": 100,
        "Endereço": "Rua Principal, 123",
        "Cidade": "São Paulo",
        "Estado": "SP",
        "CEP": "01310-100",
        "Notas": "Cliente importante",
        "Representante": "001234",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "template-clientes.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Importar Clientes</h1>
          <p className="text-slate-600">Importe clientes em lote via arquivo Excel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Carregar Arquivo</CardTitle>
              <CardDescription>
                Selecione um arquivo Excel (.xlsx) com os dados dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:underline font-medium">
                    Clique para selecionar
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-slate-500 mt-2">
                  {file ? file.name : "ou arraste o arquivo aqui"}
                </p>
              </div>

              {preview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview dos dados:</p>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          {Object.keys(preview[0]).map((key) => (
                            <th key={key} className="px-3 py-2 text-left font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50">
                            {Object.values(row).map((value, vIdx) => (
                              <td key={vIdx} className="px-3 py-2">
                                {String(value).substring(0, 30)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={!file || isLoading || importMutation.isPending}
                  className="flex-1"
                >
                  {importMutation.isPending ? "Importando..." : "Importar Clientes"}
                </Button>
                <Button onClick={() => setFile(null)} variant="outline">
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Template</CardTitle>
              <CardDescription>Baixe o modelo de arquivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={downloadTemplate} variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Baixar Template
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-blue-900">Colunas esperadas:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Nome da Fazenda *</li>
                  <li>• Nome do Produtor *</li>
                  <li>• E-mail</li>
                  <li>• Telefone</li>
                  <li>• WhatsApp</li>
                  <li>• Tipo de Animal</li>
                  <li>• Quantidade de Animais</li>
                  <li>• Endereço</li>
                  <li>• Cidade</li>
                  <li>• Estado</li>
                  <li>• CEP</li>
                  <li>• Notas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      {result && (
        <Card className={result.errors.length > 0 ? "border-yellow-200" : "border-green-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.errors.length > 0 ? (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Importação Concluída com Avisos
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Importação Concluída com Sucesso
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Clientes Criados</p>
                <p className="text-2xl font-bold text-green-600">{result.created}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Clientes Atualizados</p>
                <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-900 mb-2">Erros encontrados:</p>
                <ul className="text-xs text-yellow-800 space-y-1">
                  {result.errors.map((error: string, idx: number) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
