
import React from 'react';
import { KeyInfo } from '../types';

interface KeyInfoTableProps {
  keyInfoList: KeyInfo[] | null;
}

const KeyInfoTable: React.FC<KeyInfoTableProps> = ({ keyInfoList }) => {
  if (!keyInfoList || keyInfoList.length === 0) {
    return (
      <div className="p-6 bg-slate-800 rounded-lg shadow-xl text-center">
        <p className="text-slate-400">Enter or generate a private key to see details.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden">
      <h2 className="text-2xl font-semibold text-sky-400 p-6">Derived Key Information</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Value / Address / Balance</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {keyInfoList.map((item, index) => (
              <React.Fragment key={`${item.type}-${index}`}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">{item.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-100 font-mono break-all">{item.value}</td>
                </tr>
                {item.isAddress && (
                  <tr className="bg-slate-800 hover:bg-slate-700/50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-400 pl-10">Balance</td>
                    <td className="px-6 py-3 text-sm text-slate-100 font-mono">
                      {item.loadingBalance ? (
                        <span className="text-sky-400">Loading...</span>
                      ) : item.errorBalance ? (
                        <span className="text-red-400">{item.errorBalance}</span>
                      ) : (
                        item.balance || <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeyInfoTable;
