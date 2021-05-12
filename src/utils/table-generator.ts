import jspdf from 'jspdf';
import autotable, { UserOptions } from 'jspdf-autotable';

function generateTable(doc: jspdf, options: UserOptions) {
  autotable(doc, options);
}

export default {
  generateTable,
};
