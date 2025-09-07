import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import PDFDocument from 'pdfkit';

const app = express();
const PORT = 3000;
const url = "https://calendarific.com/api/v2";
const api_key = "XjcT7JGvrg4AltVVFxbsXOmslRNhWKmI";

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Home page
app.get('/', (req, res) => {
    res.render('index', { 
        content: "Give me the data ", 
        data: [], 
        country: '', 
        year: '' 
    });
});

// Fetch holidays and display
app.post('/holidays', async (req, res) => {
    const country = req.body.country;
    const year = req.body.year;
    try {
        const response = await axios.get(`${url}/holidays`, {
            params: {
                api_key: api_key,
                country: country,
                year: year
            }
        });

        const holidays = response.data.response.holidays.map(h => ({
            name: h.name,
            type: h.type,
            date: h.date.iso
        }));

        res.render('index', { 
            content: "Here are your holidays", 
            data: holidays, 
            country, 
            year 
        });

    } catch (error) {
        res.render('index', { 
            content: "Error fetching holidays", 
            data: [], 
            country, 
            year 
        });
    }
});


app.post('/download-pdf', async (req, res) => {
    const country = req.body.country;
    const year = req.body.year;
    try {
        const response = await axios.get(`${url}/holidays`, {
            params: {
                api_key: api_key,
                country: country,
                year: year
            }
        });

        const holidays = response.data.response.holidays.map(h => ({
            name: h.name,
            type: h.type,
            date: h.date.iso
        }));

        const doc = new PDFDocument();
        const filename = `Holidays_${country}_${year}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);
        doc.fontSize(10).text(`Holidays in ${country} for ${year}`, { underline: true });
        doc.moveDown();

        holidays.forEach((h, i) => {
           // doc.fontSize(10).text(`${i + 1}. ${h.name} (${h.type}) - ${h.date}`);
            doc.fillColor('black').text(`${i + 1}. `, { continued: true });

    
    doc.fillColor('black').text(`${h.name} `, { continued: true });

    
    doc.fillColor('blue').text(`(${h.type}) `, { continued: true });

    
    doc.fillColor('red').text(`- ${h.date}`);
});
        

        doc.end();

    } catch (error) {
        res.status(500).send('Error generating PDF');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
