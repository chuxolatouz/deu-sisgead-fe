import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { ExpandMore, Search } from "@mui/icons-material";
import VendorDashboardLayout from "components/layouts/vendor-dashboard";
import { H3 } from "components/Typography";

const tutorials = [
  {
    title: "Recuperar y cambiar la contraseña",
    steps: [
      "En la pantalla de acceso, selecciona Recuperar contraseña.",
      "Escribe el correo registrado y revisa el mensaje con la contraseña temporal.",
      "Inicia sesión con la contraseña temporal.",
      "El sistema solicitará crear una contraseña definitiva antes de continuar.",
    ],
  },
  {
    title: "Crear y editar un proyecto",
    steps: [
      "Abre Portafolio y selecciona Crear proyecto.",
      "Completa el nombre, objetivo general, objetivos específicos, fechas y departamento.",
      "Guarda el proyecto y abre su detalle para continuar la configuración.",
      "El propietario o un superadministrador puede editar nombre y objetivos desde la acción Editar.",
    ],
  },
  {
    title: "Registrar una actividad",
    steps: [
      "Abre el detalle del proyecto y entra en Actividades.",
      "Selecciona Registrar actividad y describe el trabajo a realizar.",
      "Asocia uno o más objetivos específicos del proyecto.",
      "Indica el monto general, adjunta documentos iniciales y guarda.",
    ],
  },
  {
    title: "Agregar y gestionar items",
    steps: [
      "En la fila de la actividad, abre Items.",
      "Agrega el nombre, descripción, monto y cuenta de cada item con gasto.",
      "Un item con monto cero debe permanecer sin cuenta.",
      "Los items pendientes pueden editarse o eliminarse; los cerrados quedan en modo consulta.",
    ],
  },
  {
    title: "Cerrar items y subir respaldos",
    steps: [
      "Abre Items y completa referencia, banco y monto de transferencia cuando corresponda.",
      "Adjunta opcionalmente imágenes o PDF de respaldo.",
      "Selecciona Cerrar item para avanzar uno solo o Cerrar items pendientes para procesarlos juntos.",
      "Los documentos quedan disponibles en el expediente administrativo de la actividad.",
    ],
  },
  {
    title: "Finalizar y descargar el informe",
    steps: [
      "Confirma que todos los items tengan cierre administrativo.",
      "Selecciona Finalizar actividad y registra resultados, logros, limitaciones, lecciones y líneas de acción.",
      "Adjunta las imágenes del resultado y confirma la finalización.",
      "Usa el icono PDF de la fila para descargar el informe de esa actividad.",
    ],
  },
];

const faqs = [
  [
    "¿Quién puede realizar un cierre administrativo?",
    "Los usuarios con rol administrativo autorizado para el proyecto o departamento.",
  ],
  [
    "¿Puedo registrar una actividad sin gasto?",
    "Sí. Usa monto cero y no selecciones una cuenta contable.",
  ],
  [
    "¿Por qué no puedo seleccionar Patrocinada?",
    "La opción permanece deshabilitada hasta que exista una cuenta institucional de patrocinio configurada.",
  ],
  [
    "¿Una actividad puede tener varios objetivos?",
    "Sí. Puedes seleccionar uno o más objetivos específicos pertenecientes al proyecto.",
  ],
  [
    "¿Puedo editar un item cerrado?",
    "No. El cierre administrativo conserva el item como registro de auditoría. Solo los items pendientes son editables.",
  ],
  [
    "¿Los respaldos son obligatorios?",
    "No. Son opcionales y aceptan imágenes o PDF, hasta 10 archivos de 10 MB por operación.",
  ],
  [
    "¿Cuándo puedo finalizar una actividad?",
    "Cuando todos sus items estén cerrados administrativamente y la actividad figure En progreso.",
  ],
  [
    "¿Puedo descargar un informe antes de finalizar?",
    "Sí. Los datos todavía no registrados aparecerán como POR DEFINIR.",
  ],
  [
    "¿Por qué no puedo editar una actividad finalizada?",
    "La finalización bloquea cambios para conservar la integridad del informe y del historial administrativo.",
  ],
];

AyudaPage.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function AyudaPage() {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredTutorials = useMemo(
    () =>
      tutorials.filter(
        (tutorial) =>
          !normalizedQuery ||
          `${tutorial.title} ${tutorial.steps.join(" ")}`
            .toLowerCase()
            .includes(normalizedQuery)
      ),
    [normalizedQuery]
  );
  const filteredFaqs = useMemo(
    () =>
      faqs.filter(
        ([question, answer]) =>
          !normalizedQuery ||
          `${question} ${answer}`.toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery]
  );

  const empty = tab === 0 ? !filteredTutorials.length : !filteredFaqs.length;

  return (
    <Box py={4}>
      <H3>Ayuda</H3>
      <Typography color="text.secondary" mt={0.5} mb={3}>
        Consulta los procesos principales del sistema y respuestas a dudas
        frecuentes.
      </Typography>

      <TextField
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar en la ayuda"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mt: 2, mb: 2 }}
      >
        <Tab label="Tutoriales" />
        <Tab label="Preguntas frecuentes" />
      </Tabs>

      {empty && (
        <Alert severity="info">
          No se encontraron resultados para esta búsqueda.
        </Alert>
      )}

      <Stack spacing={1}>
        {tab === 0 &&
          filteredTutorials.map((tutorial) => (
            <Accordion key={tutorial.title} disableGutters>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>{tutorial.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack component="ol" spacing={1} sx={{ pl: 3, my: 0 }}>
                  {tutorial.steps.map((step) => (
                    <Typography component="li" key={step}>
                      {step}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        {tab === 1 &&
          filteredFaqs.map(([question, answer]) => (
            <Accordion key={question} disableGutters>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>{question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
      </Stack>
    </Box>
  );
}
